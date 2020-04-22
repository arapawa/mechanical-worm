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

    const newHtml = `<p>Health &amp; Fitness focuses on key health metrics and managing the many aspects that contribute to your lifestyle, such as, nutrition, activity, sleep, and stress. This can help you achieve greater financial stability, improve your engagement and resilience at work, and help generate stronger connections to your community.</p><p style="margin-bottom: 10px;"><strong>Start by clicking one of our focused 6-week Paths below &mdash; and look for other resources with the red Health &amp; Fitness flag! Each features six interactive sessions along with weekly surveys (completion required to earn points).</strong></p><div class="aduro-app-callout" style="padding: 10px 10px; margin: 40 auto 20 auto;"><a href="https://amp.adurolife.com/referral/limeade-signup" target="_blank" rel="noopener"><img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/App_CTA_HF.png" alt="AMP callout" /></a></div><div class="one-on-one-callout" style="margin-bottom: 20px;"><a href="/api/redirect?url=https%3A//wellmetricssurveys.secure.force.com/Calendar/ProgramCalendarV2%3Fe=%5Be%5D%26formType=%26calendarName=Ignite+Your+Life%26participantCode=%5Bparticipantcode%5D" target="_blank" rel="noopener"><img class="one-on-one-image" style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/Coaching_CTA_HF.png" alt="One-on-One Coaching" /></a></div><div class="coaching-programs-container"><div class="coaching-program-callout stress_relief_toolkit" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DStress%20Relief%20Toolkit%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-stress-toolkit.png" alt="Stress Relief Toolkit" /></a></div><div class="coaching-program-callout rethinking_stress" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DRethinking%20Stress%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-rethinking-stress.png" alt="Rethinking Stress" /></a></div><div class="coaching-program-callout mission_nutr" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DMission%20Nutrition%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-mission-nutrition.png" alt="Mission Nutrition" /></a></div><div class="coaching-program-callout mood_food" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DMood%20%252526%20Food%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite+Your+Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-mood-and-food.png" alt="Mood and Food" /></a></div><div class="coaching-program-callout lighten_up" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DLighten%20Up%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-lighten-up.png" alt="Lighten Up" /></a></div><div class="coaching-program-callout breathe_easy" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DBreathe%20Easy%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-breathe-easy.png" alt="Breathe Easy" /></a></div><div class="coaching-program-callout sleep_mode" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DSleep+mode%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite+Your+Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-sleep-mode.png" alt="Breathe Easy" /></a></div><div class="coaching-program-callout get_moving" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DGet%20Moving%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-get-moving.png" alt="Breathe Easy" /></a></div><div class="coaching-program-callout fast_fitness" style="margin-bottom: 20px;"><a href="/api/Redirect?url=https%3A%2F%2Fwellmetricssurveys.secure.force.com%2FEvent%2FCoachingEventCheckin%3Fp%3D%5Be%5D%26cpName%3DFast%20Fitness%26participantCode%3D%5Bparticipantcode%5D%26eventType%3DIgnite%20Your%20Life" target="_blank" rel="noopener"> <img style="width: 100%;" src="https://cdn.adurolife.com/assets/hp/images/hp-tile-fast-fitness.png" alt="" /> </a></div></div>`;

    const coachingClients = clients.filter(client => client.fields['Coaching'] === 'Yes');
    console.log(coachingClients);

    // Set counter based on coachingClients
    $('#counter').html(`<p><span id="finishedUploads">0</span> / ${coachingClients.length}</p>`);

    coachingClients.map(client => {

      // 1 - Get current ID -2351 using limeade's modern API
      if (client.fields['LimeadeAccessToken']) {

        console.log('Getting CIE 2351 for ' + client.fields['Account Name']);

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
          // massUpdater(activities);

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

  function selectClient(e) {
    clients.forEach((client) => {
      if (client.fields['Limeade e='] === e.target.value) {
        setSelectedClient(client);
      }
    });
  }

  function renderEmployerNames() {
    return clients.map((client) => {
      return <option key={client.id}>{client.fields['Limeade e=']}</option>;
    });
  }

  function performUpdate(activity) {
    console.log(activity.client);

    const employerName = activity.client.fields['Limeade e='];
    $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success');
  }

  function renderActivities() {

    return activities.map((activity) => {
      const employerName = activity.client.fields['Limeade e='];

      return (
        <tr id={employerName.replace(/\s*/g, '')} key={employerName}>
          <td>{activity.client.fields['Account Name']}</td>
          <td>{activity.Name}</td>
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
