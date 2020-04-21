import React, { useState, useEffect } from 'react';
import moment from 'moment';

import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appN1J6yscNwlzbzq');

import Header from './header';
import Footer from './footer';
import Modal from './modal';

function clientsReducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [tiles, setTiles] = useState([]);

  const [clients, dispatch] = React.useReducer(
    clientsReducer,
    [] // initial clients
  );

  // When app first mounts, fetch clients
  useEffect(() => {

    base('Clients').select({
      view: 'sorted'
    }).eachPage((records, fetchNextPage) => {
      dispatch(records);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function massUpdater(activities) {

    const activitiesToUpdate = activities.filter(activity => {

      // Skip CIEs and find tiles using old image server
      if (activity.ChallengeId > 0 && activity.AboutChallenge.includes('mywellnessnumbers.com/ChallengeBank/')) {

        const today = moment();
        const endDate = moment(activity.EndDate);

        if (today < endDate) {
          return true;
        }

      }

    });

    console.log(activitiesToUpdate);

    activitiesToUpdate.map(activity => {
      const updatedAboutChallenge = activity.AboutChallenge.replace(/https:\/\/mywellnessnumbers.com\/ChallengeBank\//g, 'https://cdn.adurolife.com/dsjx/aduro/legacy/');
      const data = {
        AboutChallenge: updatedAboutChallenge
      };

      $.ajax({
        url: 'https://api.limeade.com/api/admin/activity/' + activity.ChallengeId,
        type: 'PUT',
        data: JSON.stringify(data),
        dataType: 'json',
        headers: {
          Authorization: 'Bearer ' + selectedClient.fields['LimeadeAccessToken']
        },
        contentType: 'application/json; charset=utf-8'
      }).done((result) => {
        console.log('Done', result);
      });

    });

  }

  function getActivity() {
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

          setActivities([...activities, activity]);

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

  function renderActivities() {

    // Filter out CIEs and past activities
    const filteredActivities = activities.filter(activity => {
      return activity.ChallengeId === -2351;
    });

    return filteredActivities.map((activity) => {
      return (
        <tr key={activity.employerName}>
          <td>{activity.employerName}</td>
          <td>{activity.Name}</td>
          <td>{activity.EventCode}</td>
          <td>{activity.ActivityReward.Value}</td>
          <td>{activity.DisplayPriority}</td>
        </tr>
      );
    });
  }

  console.log(activities);

  return (
    <div id="app">
      <Header />

      <div className="form-group">
        <label htmlFor="employerName">EmployerName</label>
        <select id="employerName" className="form-control custom-select" onChange={(e) => selectClient(e)}>
          <option defaultValue>Select Employer</option>
          {renderEmployerNames()}
        </select>
      </div>

      <button type="button" className="btn btn-primary" onClick={getActivity}>I Want Everything</button>
      <img id="spinner" src="images/spinner.svg" />
      <p>(shows all challenges current and scheduled)</p>

      <table className="table table-hover table-striped" id="activities">
        <thead>
          <tr>
            <th scope="col">EmployerName</th>
            <th scope="col">Name</th>
            <th scope="col">EventCode</th>
            <th scope="col">Points</th>
            <th scope="col">DisplayPriority</th>
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
