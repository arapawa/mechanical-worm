import React, { useState, useEffect } from 'react';
import moment from 'moment';

import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');

import Header from './header';
import Footer from './footer';
import Modal from './modal';

function clientsReducer(state, action) {
  return [...state, ...action];
}

function activitiesReducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, dispatchClients] = React.useReducer(
    clientsReducer,
    [] // initial clients
  );
  const [activities, dispatchActivities] = React.useReducer(
    clientsReducer,
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

  function massUpdater() {

    const coachingClients = clients.filter(client => client.fields['Coaching'] === 'Yes');

    // Set counter based on coachingClients
    $('#counter').html(`<p><span id="finishedUploads">0</span> / ${coachingClients.length}</p>`);

    coachingClients.map(client => {

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

        }).fail((xhr, textStatus, error) => {
          console.error(`${client.fields['Account Name']} - GET ActivityLifecycle has failed`);
        });

      } else {
        console.error(`${client.fields['Account Name']} has no LimeadeAccessToken`);
      }

      // 2 - Update CIE 2351 using limeade's old transporter API

    });

  }

  function getActivities() {
    if (selectedClient) {
      if (selectedClient.fields['LimeadeAccessToken']) {

        console.log('Getting CIE 2351 for ' + selectedClient.fields['Account Name']);
        $('#spinner').show();

        $.ajax({
          url: 'https://api.limeade.com/api/admin/activity/-2351',
          type: 'GET',
          dataType: 'json',
          headers: {
            Authorization: 'Bearer ' + selectedClient.fields['LimeadeAccessToken']
          },
          contentType: 'application/json; charset=utf-8'
        }).done((result) => {
          $('#spinner').hide();
          const activity = result.Data;
          activity.employerName = selectedClient.fields['Account Name'];

          // handles any updates needed for every activity in the platform
          dispatchActivities([...activities, activity]);

        }).fail((xhr, textStatus, error) => {
          console.error(`${selectedClient.fields['Account Name']} - GET ActivityLifecycle has failed`);
        });

      } else {
        console.error(`${selectedClient.fields['Account Name']} has no LimeadeAccessToken`);
      }
    } else {
      console.log('No client has been selected');
    }
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

    // Add new path to the beginning of the coaching-programs-container
    const htmlDescription = activity.AboutChallenge.replace(
      '<div class="coaching-programs-container">',
      '<div class="coaching-programs-container"><div class="coaching-program-callout anxiety_antidote" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DAnxiety%20Antidote%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-anxiety-antidote.png" alt="Anxiety Antidote" /></a></div>'
    );

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
			'1', // ShowInProgram
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
  };

  function performUpdate(activity) {
    if (activity.AboutChallenge.includes('anxiety_antidote')) {
      console.log('anxiety_antidote found, update not needed');
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

  function renderActivities() {

    return activities.map((activity) => {
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
            <button type="button" className="btn btn-primary" onClick={() => performUpdate(activity)}>Upload</button>
          </td>
        </tr>
      );
    });

  }

  return (
    <div id="app">
      <Header />

      <div className="form-group">
        <button type="button" className="btn btn-primary" onClick={massUpdater}>Download Activities</button>
        <div id="counter"></div>
      </div>

      <table className="table table-hover table-striped" id="activities">
        <thead>
          <tr>
            <th scope="col">Account Name</th>
            <th scope="col">Name</th>
            <th scope="col">Points</th>
            <th scope="col">DisplayPriority</th>
            <th scope="col">Upload</th>
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
