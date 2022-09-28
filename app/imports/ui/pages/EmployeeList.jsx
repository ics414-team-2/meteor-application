import React, { useState } from 'react';
import _ from 'lodash';
import { Col, Container, Row, Table, InputGroup, Form } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { PAGE_IDS } from '../utilities/PageIDs';
import EmployeeListItem from '../components/EmployeeListItem';
import { UserProfiles } from '../../api/user/UserProfileCollection';
import { AdminProfiles } from '../../api/user/AdminProfileCollection';

/* Renders a table containing all of the Stuff documents. Use <StuffItemAdmin> to render each row. */
const EmployeeList = () => {
  const [search, setSearch] = useState('');

  const { ready, profiles } = useTracker(() => {
    const userSubscription = UserProfiles.subscribe();
    const adminSubscription = AdminProfiles.subscribe();
    const rdy = userSubscription.ready() && adminSubscription.ready();

    const user = UserProfiles.find({}, { sort: { username: 1 } }).fetch();
    const admin = AdminProfiles.find({}, { sort: { username: 1 } }).fetch();

    const users = _.sortBy(user.concat(admin), (obj) => obj.lastName);
    return ({
      ready: rdy,
      profiles: users,
    });
  }, []);

  return (ready ? (
    <Container id={PAGE_IDS.MEMBERS} className="py-3" style={{ marginTop: '50px' }}>
      <Row>
        <Col>
          <h1 className="montserrat" style={{ textAlign: 'left', fontSize: '3.5em' }}>EMPLOYEE LIST</h1>
        </Col>
        <Col xs={4}>
          <InputGroup className="mb-3" style={{ marginTop: '1em' }}>
            <Form.Control
              placeholder="Search"
              aria-label="Search"
              onChange={event => setSearch(event.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col>
          <Table striped className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>View Profile</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line array-callback-return,consistent-return */}
              {profiles.filter(post => {
                if (search === '') {
                  return post;
                }
                if (post.firstName.toLowerCase().includes(search.toLowerCase())) {
                  return post;
                }
                if (post.lastName.toLowerCase().includes(search.toLowerCase())) {
                  return post;
                }
                if (post.email.toLowerCase().includes(search.toLowerCase())) {
                  return post;
                }
              }).map((profile, index) => <EmployeeListItem key={index} profile={{ _id: profile._id, name: `${profile.firstName} ${profile.lastName}`, email: profile.email, employeeID: profile.employeeID }} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  ) : '');
};

export default EmployeeList;
