import React, { useState, useEffect } from 'react';
import moment from 'moment';

import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');

import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
import Footer from './footer';
import Modal from './modal';

import csvToJson from '../helpers/csv_to_json';

function reducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  const [clientsFromCsv, setClientsFromCsv] = useState([]);
  const [clients, dispatchClients] = React.useReducer(
    reducer,
    [] // initial clients
  );
  const [activities, dispatchActivities] = React.useReducer(
    reducer,
    [] // initial activities
  );

  // When app first mounts, fetch clients
  useEffect(() => {

    base('Clients').select({
      view: 'sorted'
    }).eachPage((records, fetchNextPage) => {
      dispatchClients(records);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function getActivities() {

    let filteredClients;

    // If using a CSV file
    if (clientsFromCsv.length > 0) {

      // Create list of account names from the CSV
      const accountNamesList = clientsFromCsv.map(client => client['Account']);

      // Filter clients by the list of account names in the user uploaded CSV
      filteredClients = clients.filter(client => {
        return accountNamesList.includes(client.fields['Salesforce Name']);
      });

    } else {
      filteredClients = Array.from(clients);
    }
    console.log('filteredClients', filteredClients);

    // Set counter based on filteredClients
    $('#counter').html(`<p><span id="finishedUploads">0</span> / ${filteredClients.length}</p>`);

    filteredClients.map(client => {

      // 1 - Get current ID -1391 using limeade's modern API
      if (client.fields['LimeadeAccessToken']) {

        $.ajax({
          url: 'https://api.limeade.com/api/admin/activity/-1391',
          type: 'GET',
          dataType: 'json',
          headers: {
            Authorization: 'Bearer ' + client.fields['LimeadeAccessToken']
          },
          contentType: 'application/json; charset=utf-8'
        }).done((result) => {

          // Advance the counter
          let count = Number($('#finishedUploads').html());
          $('#finishedUploads').html(count + 1);

          const activity = result.Data;
          activity.client = client;
          dispatchActivities([...activities, activity]);

        }).fail((request, status, error) => {
          console.log(`${client.fields['Account Name']} - ${request.responseJSON.Error.Message}`);
        });

      } else {
        console.error(`${client.fields['Account Name']} has no LimeadeAccessToken`);
      }

    });

  }

  function createCSV(activity) {
    let data = [[
      'EmployerName',
      'EventId',
      'EventName',
      'DisplayPriority',
      'RewardType',
      'PointsAwarded',
      'RewardDescription',
      'AllowSameDayDuplicates',
      'IsOngoing',
      'IsDisabled',
      'ShowInProgram',
      'IsSelfReport',
      'DataFeedMode',
      'Notify',
      'ButtonText',
      'TargetUrl',
      'EventImageUrl',
      'MaxOccurrences',
      'StartDate',
      'EndDate',
      'ViewPages',
      'Dimensions',
      'ShortDescription',
      'HtmlDescription',
      'SubgroupId',
      'Field1Name',
      'Field1Value',
      'Field2Name',
      'Field2Value',
      'Field3Name',
      'Field3Value'
    ]];

    // Pulled from original activity
    const employerName = activity.client.fields['Limeade e='];
    const eventId = activity.ChallengeId * -1;
    const eventName = activity.Name;
    const displayPriority = activity.DisplayPriority;
    const pointsAwarded = activity.ActivityReward.Value;
    const eventImageUrl = activity.ChallengeLogoURL;
    const showInProgram = activity.DisplayInProgram ? '1' : '0';

    const htmlDescription = '<p>Wherever you are sitting or standing, you have a ton of power. What do you want to accomplish in the next year? Watch<strong> <a href="https://vimeo.com/adurolife/review/479996269/7d11942586" target="_blank" rel="noopener">this video</a></strong> to get excited about your possibilities.</p><p>&nbsp;</p><p>Use the <strong><a href="https://cdn.adurolife.com/pjrz/coaching/documents/workbooks/Open-to-Possibility-Workbook.pdf" target="_blank" rel="noopener">Open to Possibility Worksheet</a></strong> to write down your ideas for this year, your goals for this month, and your commitment for today.</p><p>&nbsp;</p><hr size="1" /><h2 style="text-align: center;">Watch the video <a href="https://vimeo.com/adurolife/review/479996269/7d11942586" target="_blank" rel="noopener">HERE</a>.</h2><hr size="1" /><p style="text-align: center;">After watching the video and getting started on the worksheet, be sure to fill out <strong><a href="/api/Redirect?url=https%3A%2F%2Fsurvey.clicktools.com%2Fapp%2Fsurvey%2Fgo.jsp%3Fiv%3D2mqxa2p044ous%26q1%3D%5Bparticipantcode%5D%26q2%3D%5Be%5D%22" target="_blank" rel="noopener">the survey</a></strong> to confirm that you have completed this activity.</p>';

    // Static values for this update
    const maxOccurrences = '1';

		// Add one CIE to the data array
		data.push([
			employerName,
			eventId,
			eventName,
			displayPriority,
			'IncentivePoints', // RewardType
			pointsAwarded,
			'', // RewardDescription
			'1', // AllowSameDay
			'0', // IsOngoing
			'0', // IsDisabled
			showInProgram,
			'0', // IsSelfReport
      '0', // DataFeedMode
			'0', // Notify
			'', // ButtonText
			'', // TargetUrl
			eventImageUrl,
			maxOccurrences,
			'', // StartDate
			'', // EndDate
			'', // ViewPages
			'', // Dimensions
			'', // ShortDescription
      `"${htmlDescription.replace(/"/g, '""')}"`,
			'', // SubgroupId
			'', // Field1Name
			'', // Field1Value
      '', // Field2Name
			'', // Field2Value
      '', // Field3Name
			'' // Field3Value
		]);

    return data;
  }

  function performUpdate(activity) {
    if (activity.AboutChallenge.includes('clicktools')) {
      console.log('clicktools found, update unnecessary');
    } else {

      const employerName = activity.client.fields['Limeade e='];
      const psk = activity.client.fields['Limeade PSK'];

      const csv = createCSV(activity);
      const url = 'https://calendarbuilder.dev.adurolife.com/limeade-upload/';

      const params = {
        e: employerName,
        psk: psk,
        data: csv.join('\n'),
        type: 'IncentiveEvents'
      };

      $.post(url, params).done((response) => {
        // check if Limeade silently fails
        if (response.includes('error') || response.includes('err') ) {
          $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
          console.error(`Error for ${employerName} ${response}`);
        } else { // success
          $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success text-white');
        }
      }).fail((request, status, error) => {
        $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
        console.error(request.status);
        console.error(request.responseText);
        console.log('Update CIE failed for client ' + employerName);
      });

    }
  }

  function handleClientsCsvFiles(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: function(results) {
        console.log('Clients:', results.data);
        setClientsFromCsv(results.data);
      }
    });
  }

  function renderActivities() {

    let sortedActivities = Array.from(activities);

    // Sorts the list of activities
    sortedActivities.sort((a, b) => {
      const nameA = a.client.fields['Account Name'].toLowerCase();
      const nameB = b.client.fields['Account Name'].toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return sortedActivities.map((activity) => {
      const employerName = activity.client.fields['Limeade e='];
      const domain = activity.client.fields['Domain'];
      const eventId = activity.ChallengeId * -1;

      return (
        <tr id={employerName.replace(/\s*/g, '')} key={employerName}>
          <td>{activity.client.fields['Account Name']}</td>
          <td><a href={`${domain}/Home/?cid=${eventId}`} target="_blank">{activity.Name}</a></td>
          <td>{activity.ActivityReward.Value}</td>
          <td>{activity.DisplayPriority}</td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => performUpdate(activity)}>Update</button>
          </td>
        </tr>
      );
    });

  }

  return (
    <div id="app">
      <Header />

      <div className="form-group">
        <label htmlFor="csvClientsInput">Import from CSV</label>
        <input type="file" className="form-control-file" id="csvClientsInput" accept="*.csv" onChange={(e) => handleClientsCsvFiles(e)} />
        <small className="form-text text-muted text-left">Note: file matches <code>Account</code> in .csv with <code>Salesforce Name</code> in Clients Most up to Date.</small>
      </div>

      <div className="form-group">
        <button type="button" className="btn btn-primary" onClick={getActivities}>Download Activities</button>
        <div id="counter"></div>
      </div>

      <table className="table table-hover table-striped" id="activities">
        <thead>
          <tr>
            <th scope="col">Account Name</th>
            <th scope="col">Name</th>
            <th scope="col">Points</th>
            <th scope="col">DisplayPriority</th>
            <th scope="col">Update</th>
          </tr>
        </thead>
        <tbody>
          {renderActivities()}
        </tbody>
      </table>

      <Footer />

    </div>
  );
}

export default App;
