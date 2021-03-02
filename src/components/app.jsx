import React, { useState, useEffect } from 'react';
import moment from 'moment';

import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');

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

      console.log('clients', clients);
      // Create list of account names from the CSV
      const accountNamesList = clientsFromCsv.map(client => client['Account']);
      console.log('accountNamesList', accountNamesList);

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

      // 1 - Get current ID -2355 using limeade's modern API
      if (client.fields['LimeadeAccessToken']) {

        $.ajax({
          url: 'https://api.limeade.com/api/admin/activity/-2355',
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

    const htmlDescription = '<p>Relationships &amp; Community focuses on your connection with others. Healthy social connections and all supportive relationships can improve your health and well-being. Caring and being cared for by others builds and strengthens community and belonging.</p><div style="margin: 1em 0;"><a style="display: block;" href="https://amp.adurolife.com/referral/limeade-signup" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/App-CTA.png" alt="Install the Aduro app" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/redirect?url=https%3A//wellmetricssurveys.secure.force.com/Calendar/ProgramCalendarV2%3Fe=%5Be%5D%26formType=%26calendarName=Ignite+Your+Life%26participantCode=%5Bparticipantcode%5D" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/Coaching-CTA.png" alt="Schedule 1:1 Coaching" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DParental+Fundamentals%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DElevate+Your+Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/Parental-Fundamentals-Path-Graphic.png" alt="Parental Fundamentals" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DAdventures%20in%20Parenting%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/Adventures-in-Parenting-Path-Graphic.png" alt="Adventures in Parenting" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DEffective%20Listening%20Skills%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/Effective-Listening-Path-Graphic.png" alt="Effective Listening Skills" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DNew+Expectations%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DElevate+Your+Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/dsjx/template/aspects-of-life/New-Expectations-Path-Graphic.png" alt="New Expectations" /></a></div><div style="margin-bottom: 1em;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DBuilding%20Strong%20Youth%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/jbrn/assets/template/aspects-of-life/building-strong-youth.png" alt="Building Strong Youth" /></a></div>';

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
    if (activity.AboutChallenge.includes('Building Strong Youth')) {
      console.log('Building Strong Youth found, update unnecessary');
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
        $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success text-white');
      }).fail((request, status, error) => {
        $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
        console.error(request.status);
        console.error(request.responseText);
        console.log('Update CIE failed for client ' + employerName);
      });

    }
  }

  function handleClientsCsvFiles(e) {
    let reader = new FileReader();
    reader.onload = function() {
      // Parse the client csv and update state
      const clientsJson = csvToJson(reader.result);
      setClientsFromCsv(clientsJson);
    };
    // Start reading the file. When it is done, calls the onload event defined above.
    reader.readAsBinaryString(e.target.files[0]);
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
