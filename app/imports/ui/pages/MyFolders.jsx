import React from 'react';
import { Container, ProgressBar, Row, Tab, Col, Nav, Table, Tabs } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import swal from 'sweetalert';
import Swal from 'sweetalert2';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { PAGE_IDS } from '../utilities/PageIDs';
import { UserProfiles } from '../../api/user/UserProfileCollection';
import { updateMethod } from '../../api/base/BaseCollection.methods';
import { AdminProfiles } from '../../api/user/AdminProfileCollection';
import { Measures } from '../../api/measure/MeasureCollection';
import LoadingSpinner from '../components/LoadingSpinner';

/* Renders a drop down menu  that has a collection of bills that are favorited */
// eslint-disable-next-line no-unused-vars

const billProgress = 60;

/* Component for layout out a Measures */
const MeasureComponent = ({ measure }) => (
  <Link className="table-row" as={NavLink} exact to={`/view-bill/${measure._id}`}>
    <th scope="row">{measure.measureNumber}</th>
    <td>{measure.measureTitle}</td>
    <td>{measure.description}</td>
    <td>{measure.currentReferral}</td>
    <td>{measure.measureType}</td>
    <td>
      <ProgressBar now={billProgress} label={`${billProgress}`} visuallyHidden />
    </td>
  </Link>
);

MeasureComponent.propTypes = {
  measure: PropTypes.shape().isRequired,
};

const MyFolders = () => {

  const { ready, /** measure, */ user } = useTracker(() => {
    const userSubscription = UserProfiles.subscribe();
    const adminSubscription = AdminProfiles.subscribe();
    // const measureSubcription = Measures.subscribe();
    const rdy = userSubscription.ready() && adminSubscription.ready();
    const username = Meteor.user() ? Meteor.user().username : '';
    // const measureData = Measures.find({}, {}).fetch();

    let usr = UserProfiles.findOne({ email: username });
    if (usr === undefined) {
      usr = AdminProfiles.findOne({ email: username });
    }

    return ({
      ready: rdy,
      user: usr,
      // measure: measureData,
    });
  }, []);

  /** const numFilter = (number) => {
    const filteredData = _.where(measure, { measureNumber: number });
  }; */

  const addFolder = (title) => {
    user.myFolders.push([]);
    const lastElement = user.myFolders[user.myFolders.length - 1];
    user.myFolders.position = user.myFolders.length - 1;
    lastElement.title = title;
    console.log(lastElement.title);
    const collectionName = UserProfiles.getCollectionName();
    const updateData = { id: user._id, myFolders: user.myFolders };
    updateMethod.callPromise({ collectionName, updateData })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => swal('Success', 'Folder created', 'success'));
  };

  const getTitle = () => {
    Swal.fire({
      title: 'Add Folder',
      text: 'Name of folder:',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: 'green',
    }).then((result) => {
      if (result.value) {
        addFolder(result.value);
      }
    });
  };

  /** const removeFolder = (remove) => {
    const folder = user.myFolders.filter(index => index === remove);
    const collectionName = UserProfiles.getCollectionName();
    const updateData = { id: user._id, myFolders: folder };
    updateMethod.callPromise({ collectionName, updateData })
        .catch(error => swal('Error', error.message, 'error'))
        .then(() => swal('Success', 'Folder deleted', 'success'));
  }; */

  return (ready ? (
    <Container id={PAGE_IDS.MY_FOLDERS}>
      <Button onClick={getTitle}>
        Add Folder
      </Button>
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row>
          <Col>
            <Nav variant="pills" className="flex-column">
              {user.myFolders.map((folder, index) => (
                <Nav.Item><Nav.Link eventKey={index}>folder.title</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
        </Row>
        <Col sm={9}>
          <Tab.Content>
            {user.myFolders.map((folder, index) => (
              <Tab.Pane eventKey={index}>
                <Col xs={20}>
                  <Tabs defaultActiveKey="all-bills" id="fill-tab-example" className="mb-3" fill>
                    <Tab eventKey="all-bills" title={index}>
                      <Row>
                        <Table>
                          <thead style={{ marginBottom: 10 }}>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Bill Title</th>
                              <th scope="col">Description</th>
                              <th scope="col">Offices</th>
                              <th scope="col">Type</th>
                              <th scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {folder.map((n) => <tr>{n}</tr>)}
                          </tbody>
                        </Table>
                      </Row>
                    </Tab>
                  </Tabs>
                </Col>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Col>

      </Tab.Container>
    </Container>
  ) : <LoadingSpinner message="Loading Measures" />);

};

export default MyFolders;
