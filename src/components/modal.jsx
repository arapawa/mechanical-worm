import React, { Component } from 'react';
import moment from 'moment';

class Modal extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    /* global $ */
		$('#aboutChallenge').trumbowyg(
			{ btns:
				[
          ['viewHTML'],
          ['undo', 'redo'], // Only supported in Blink browsers
          ['formatting'],
          ['strong', 'em', 'del'],
          ['superscript', 'subscript'],
          ['link'],
          ['foreColor', 'backColor'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ['unorderedList', 'orderedList'],
          ['horizontalRule'],
          ['removeformat']
				]
      }
    );
	}

  saveChanges(activity) {
    $('#tileModal').modal('hide');

    // TODO: Add Validation here, make sure user isn't ruining shit if possible

    console.log(activity);

    const data = {
      AboutChallenge: activity.AboutChallenge,
      ActivityReward: activity.ActivityReward,
      ActivityType: activity.ActivityType,
      EndDate: activity.EndDate,
      Name: activity.Name,
      ShortDescription: activity.ShortDescription,
      StartDate: activity.StartDate
    };

    $.ajax({
      url: 'https://api.limeade.com/api/admin/activity/' + activity.ChallengeId,
      type: 'PUT',
      data: JSON.stringify(data),
      dataType: 'json',
      headers: {
        Authorization: 'Bearer ' + this.props.client.fields['LimeadeAccessToken']
      },
      contentType: 'application/json; charset=utf-8'
    }).done(result => {

      // Do stuff here
      console.log(result);

    }).fail((xhr, textStatus, error) => {
      console.error(error);
    });
  }

  render() {
    const activity = this.props.activity;

    const isPartner = activity ? activity.PartnerId > 0 : false;
    const startDate = activity ? moment(activity.StartDate).format('YYYY-MM-DD') : '';

    return (
      <div className="modal fade" id="tileModal" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="tileModalLabel">Edit Challenge</h5>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body row" id="tileModalBody">
              <div className="col">

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="startDate">Start Date</label>
                      <input id="startDate" className="form-control" type="date" value={startDate} onChange={(e) => this.props.changeStartDate(e)} disabled={activity ? moment(activity.StartDate) <= moment() : false} />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input id="endDate" className="form-control" type="date" value={activity ? moment(activity.EndDate).format('YYYY-MM-DD') : ''} onChange={(e) => this.props.changeEndDate(e)} />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="verified">Verified</label>
                      <div className="form-check">
                        <input id="verified" className="form-check-input" name="Verified" type="radio" value="Verified" checked={isPartner} disabled />
                        <label className="form-check-label" htmlFor="verified">Verified</label>
                      </div>
                      <div className="form-check">
                        <input id="selfReport" className="form-check-input" name="Verified" type="radio" value="Self-Report" checked={!isPartner} disabled />
                        <label className="form-check-label" htmlFor="selfReport">Self-Report</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="rewardOccurrence">Reward Occurrence</label>
                      <select id="rewardOccurrence" className="form-control" disabled>
                        <option>Once</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="activityTrackingType">Activity Tracking Type</label>
                      <select id="activityTrackingType" className="form-control" disabled>
                        <option>Event</option>
                        <option>Days</option>
                        <option>Units</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="trackingText">Tracking Text</label>
                      <input id="trackingText" className="form-control" type="text" value={activity ? activity.ActivityType : ''} onChange={(e) => this.props.changeTrackingText(e)} />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="activityGoal">Activity Goal</label>
                      <input id="activityGoal" className="form-control" type="text" value={activity ? activity.ChallengeTarget : ''} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-3">
                    <div className="form-group">
                      <label htmlFor="points">Points</label>
                      <input id="points" className="form-control" type="text" value={activity ? activity.ActivityReward.Value : ''} onChange={(e) => this.props.changePoints(e)} />
                    </div>
                  </div>
                </div>

              </div>
              <div className="col">
                <img className="tile-image mb-3" src={activity ? activity.ChallengeLogoURL : ''} />

                <div className="form-group">
                  <input className="form-control" type="text" value={activity ? activity.Name : ''} onChange={(e) => this.props.changeName(e)} />
                </div>

                <div className="form-group">
                  <textarea className="form-control" type="text" value={activity ? activity.ShortDescription : ''} onChange={(e) => this.props.changeShortDescription(e)}></textarea>
                </div>

                <div id="aboutChallenge" dangerouslySetInnerHTML={{ __html: activity ? activity.AboutChallenge : '' }}></div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-link" data-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => this.saveChanges(activity)}>Save</button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
