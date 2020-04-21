import React, { useState, useEffect } from 'react';
import moment from 'moment';

import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appN1J6yscNwlzbzq');

import Header from './header';
import Footer from './footer';
import Modal from './modal';
import Tile from './tile';

import dynamicSort from '../helpers/dynamicSort';

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

  function getHomePageActivities(client) {
    if (client) {
      if (client.fields['LimeadeAccessToken']) {
        console.log('Getting visible Home page activities for ' + client.fields['Account Name']);
        $.ajax({
          url: 'https://api.limeade.com/api/activities/?types=5&status=1&attributes=1&contents=32319',
          type: 'GET',
          dataType: 'json',
          headers: {
            Authorization: 'Bearer ' + client.fields['LimeadeAccessToken']
          },
          contentType: 'application/json; charset=utf-8'
        }).done(result => {
          const tiles = result.Data;

          // Do stuff here
          console.log(tiles);
          setTiles(tiles);

        }).fail((xhr, textStatus, error) => {
          console.error(`${client.fields['Account Name']} - GET Activities has failed`);
        });

      } else {
        console.error(`${client.fields['Account Name']} has no LimeadeAccessToken`);
      }
    } else {
      console.log('No client has been selected');
    }
  }

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

  function getAllActivities() {
    if (selectedClient) {
      if (selectedClient.fields['LimeadeAccessToken']) {

        console.log('Getting all activities (past, current, and scheduled) for ' + selectedClient.fields['Account Name']);
        $('#spinner').show();

        $.ajax({
          url: 'https://api.limeade.com/api/admin/activity',
          type: 'GET',
          dataType: 'json',
          headers: {
            Authorization: 'Bearer ' + selectedClient.fields['LimeadeAccessToken']
          },
          contentType: 'application/json; charset=utf-8'
        }).done((result) => {
          $('#spinner').hide();
          const activities = result.Data;

          // handles any updates needed for every activity in the platform
          // massUpdater(activities);

          setActivities(activities);

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

  function openActivity(activity) {
    setSelectedActivity(activity);

    $('#tileModal').modal();
  }

  function changeStartDate(e) {
    const newActivity = selectedActivity;
    newActivity.StartDate = e.target.value;
    setSelectedActivity(newActivity);
  }

  function changeEndDate(e) {
    const newActivity = selectedActivity;
    newActivity.EndDate = e.target.value;
    setSelectedActivity(newActivity);
  }

  function changeTrackingText(e) {
    const newActivity = selectedActivity;
    newActivity.ActivityType = e.target.value;
    setSelectedActivity(newActivity);
  }

  function changePoints(e) {
    const newActivity = selectedActivity;
    newActivity.ActivityReward.Value = e.target.value;
    setSelectedActivity(newActivity);
  }

  function changeName(e) {
    const newActivity = selectedActivity;
    newActivity.Name = e.target.value;
    setSelectedActivity(newActivity);
  }

  function changeShortDescription(e) {
    const newActivity = selectedActivity;
    newActivity.ShortDescription = e.target.value;
    setSelectedActivity(newActivity);
  }

  function renderEmployerNames() {
    return clients.map((client) => {
      return <option key={client.id}>{client.fields['Limeade e=']}</option>;
    });
  }

  function renderTiles() {
    return tiles.map((tile) => {
      return <Tile key={tile.Id} tile={tile} />;
    });
  }

  function renderActivities() {

    // Filter out CIEs and past activities
    const filteredActivities = activities.filter(activity => {
      return activity.ChallengeId > 0 && activity.Status !== 'Completed';
    });

    filteredActivities.sort(dynamicSort('Status'));

    return filteredActivities.map((activity) => {
      return (
        <tr key={activity.ChallengeId} onClick={() => openActivity(activity)}>
          <td>{activity.Name}</td>
          <td>{activity.ChallengeId}</td>
          <td>{moment(activity.StartDate).format('ll')}</td>
          <td>{moment(activity.EndDate).format('ll')}</td>
          <td>{activity.Status}</td>
        </tr>
      );
    });
  }

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

      {/* <button type="button" className="btn btn-primary" onClick={() => this.getHomePageActivities(this.state.selectedClient)}>What's on My Home Page?</button>
      <p>(show's the home page as seen by the Admin)</p> */}

      <button type="button" className="btn btn-primary" onClick={getAllActivities}>I Want Everything</button>
      <img id="spinner" src="images/spinner.svg" />
      <p>(shows all challenges current and scheduled)</p>

      <div id="tileContainer">
        {renderTiles()}
      </div>

      <table className="table table-hover table-striped" id="activities">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">ChallengeId</th>
            <th scope="col">StartDate</th>
            <th scope="col">EndDate</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {renderActivities()}
        </tbody>
      </table>

      <Footer />

      <Modal
        client={selectedClient}
        activity={selectedActivity}
        changeStartDate={(e) => changeStartDate(e)}
        changeEndDate={(e) => changeEndDate(e)}
        changeTrackingText={(e) => changeTrackingText(e)}
        changePoints={(e) => changePoints(e)}
        changeName={(e) => changeName(e)}
        changeShortDescription={(e) => changeShortDescription(e)}
      />

    </div>
  );
}

export default App;
