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

      // Create list of account names from the CSV
      const accountNamesList = clientsFromCsv.map(client => client['Account: Account Name']);

      // Filter clients by the list of account names in the user uploaded CSV
      filteredClients = clients.filter(client => {
        return accountNamesList.includes(client.fields['Salesforce Name']);
      });

    } else {
      filteredClients = Array.from(clients);
    }

    // Set counter based on filteredClients
    $('#counter').html(`<p><span id="finishedUploads">0</span> / ${filteredClients.length}</p>`);

    filteredClients.map(client => {

      // 1 - Get current ID -2351 using limeade's modern API
      if (client.fields['LimeadeAccessToken']) {

        $.ajax({
          url: 'https://api.limeade.com/api/admin/activity/-2351',
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

    const htmlDescription = '<p>Health &amp; Fitness focuses on key health metrics and managing the many aspects that contribute to your lifestyle, such as, nutrition, activity, sleep, and stress. This can help you achieve greater financial stability, improve your engagement and resilience at work, and help generate stronger connections to your community.</p><p style="margin-top: 10px;"><strong>Start by clicking one of our focused 6-week Paths below &mdash; and look for other resources with the red Health &amp; Fitness flag! Each features six interactive sessions along with weekly surveys (completion required to earn points).</strong></p><div style="margin: 20px 0;"><a style="display: block;" href="https://amp.adurolife.com/referral/limeade-signup" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/App_CTA_HF.png" alt="Install the Aduro app" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/redirect?url=https%3A//wellmetricssurveys.secure.force.com/Calendar/ProgramCalendarV2%3Fe=%5Be%5D%26formType=%26calendarName=Ignite+Your+Life%26participantCode=%5Bparticipantcode%5D" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/Coaching_CTA_HF.png" alt="Schedule 1:1 Coaching" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DMission%20Nutrition%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-mission-nutrition.png" alt="Mission Nutrition" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DMood%20%252526%20Food%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite+Your+Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-mood-and-food.png" alt="Mood and Food" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DLighten%20Up%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-lighten-up.png" alt="Lighten Up" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DBreathe%20Easy%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-breathe-easy.png" alt="Breathe Easy" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DSleep+mode%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite+Your+Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-sleep-mode.png" alt="Breathe Easy" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DGet%20Moving%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-get-moving.png" alt="Breathe Easy" /></a></div><div style="margin-bottom: 20px;"><a style="display: block;" href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DFast%20Fitness%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-fast-fitness.png" alt="" /> </a></div>';

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
    if (!activity.AboutChallenge.includes('Decoding Drinking')) {
      console.log('Decoding Drinking not found, update unnecessary');
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
        <small className="form-text text-muted text-left">Note: file matches on Salesforce Name in Clients Most up to Date.</small>
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
