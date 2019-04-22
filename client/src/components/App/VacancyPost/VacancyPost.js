import React, { Component } from 'react'
import './VacancyPost.css'
import axios from 'axios'
import { Link } from 'react-router-dom'

class VacancyPost extends Component {
  constructor(props) {
    super(props);
    /*  
      props should have the user data
    */
    this.state = {
      postID: '5cb8b4653da6b4a548c005fb',
      //put user data here until we get them from props
      userData: {
        _id: '5cb8b44f3da6b4a548c005fa',
        userType: 'Partner',
      },
      loaded: false,
      userHasApplied: false,
      vacancyData: {},
      feedback: '',

      duration: "",
      location: "",
      description: "",
      salary: 0,
      dailyHours: 0,
      city: "",
      name: "",
    }
  }

  async componentDidMount() {
    let vacancy = await axios.get(`http://localhost:3001/api/vacancy/Post/${this.state.postID}`);
    let hired = await axios.get(`http://localhost:3001/api/vacancy/${this.state.postID}/hired`);
    this.setState({
      vacancyData: vacancy.data
    })
    this.setState({
      vacancyData: {
        ...this.state.vacancyData,
        hired: hired.data,
      },
      duration: vacancy.data.duration,
      location: vacancy.data.location,
      description: vacancy.data.description,
      salary: vacancy.data.salary,
      dailyHours: vacancy.data.dailyHours,
      name: vacancy.data.name,
      city: vacancy.data.city
    })
    this.checkIfAlreadyApplied();
  }

  getCommentsSorted() {  // Should sort all comments based on date
    var allComments = (this.state.vacancyData.commentsByAdmin).concat(this.state.vacancyData.commentsByPartner)
    return allComments.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.date) - new Date(b.date);
    });
  }

  async checkIfAlreadyApplied() {
    // check if user is found in applicants array
    let applied = false;
    let applicants = await axios.get(`http://localhost:3001/api/vacancy/${this.state.postID}/applicants`);
    for (let i = 0; i < applicants.data.length; i++) {
      if (applicants.data[i]._id === this.state.userData._id)
        applied = true;
    }
    if (applied) {
      this.setState({
        userHasApplied: true
      });
    }
    this.setState({
      loaded: true,
      vacancyData: {
        ...this.state.vacancyData,
        applicants: applicants.data
      }
    });
    console.log(this.state.vacancyData);
  }

  async onClickApprove() {
    await axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/status`, {
      "userType": "Admin",
      "status": "Open"
    }).then(res => {
      this.setState({
        vacancyDate: {
          ...this.state.vacancyData,
          status: 'Open'
        }
      })
    })
  }

  async onClickSubmit() {
    const resp = await axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}`, {
      "duration": this.state.duration,
      "location": this.state.location,
      "description": this.state.description,
      "salary": this.state.salary,
      "dailyHours": this.state.dailyHours,
      "name": this.state.name,
      "city": this.state.city
    });
    console.log(resp.data);
    this.setState({ Edit: false });
    window.location.reload();
  }

  onClickApply = (e) => {
    let flag = true;
    if (this.state.vacancyData.status !== 'Open')
      flag = false;

    //e.preventDefault();
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/apply`, {
      "userID": this.state.userData._id,
      "userType": this.state.userData.userType
    }).then(
      this.setState({
        userHasApplied: (true & flag)
      }))
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  onClickCancel = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/un-apply`, {
      "userID": this.state.userData._id,
      "userType": this.state.userData.userType
    }).then(
      this.setState({
        userHasApplied: false
      }))
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  async onClickComment(e) {
    await axios.post(`http://localhost:3001/api/vacancy/${this.state.postID}/comment`, {
      "userID": this.state.userData._id,
      "userType": this.state.userData.userType,
      "comment": this.state.feedback,
    });
    //hopefully getting the updated vacancy with the new comments
    await axios.get(`http://localhost:3001/api/vacancy/Post/${this.state.postID}`)
      .then(updatedVacancy => {
        console.log(updatedVacancy);
        this.setState({
          vacancyData: {
            ...this.state.vacancyData,
            commentsByAdmin: updatedVacancy.data.commentsByAdmin,
            commentsByPartner: updatedVacancy.data.commentsByPartner
          }
        })
      })
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  handleChange = (e) => {
    console.log('Name ' + e.target.name)
    console.log('Value ' + e.target.value)
    this.setState({ [e.target.name]: e.target.value });
  }

  //member submitting feedback on partner
  submitFeedbackMember = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:3001/api/profile/${this.state.vacancyData.partner._id}/feedback`, {
      "userType": this.state.userData.userType,
      "personID": this.state.userData._id,
      "comment": this.state.feedback
    })
      .then(this.setState({ feedback: '' }))
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  submitFeedbackPartner = (employee) => {
    //employee.preventDefault();
    axios.post(`http://localhost:3001/api/profile/${employee._id}/feedback`, {
      "userType": this.state.userData.userType,
      "personID": this.state.userData._id,
      "comment": this.state.feedback
    })
      .then(this.setState({ feedback: '' }))
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  onClickHire = (applicant) => {
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/hireMember`, {
      "userType": this.state.userData.userType,
      "userID": this.state.userData._id,
      "memberID": applicant._id
    }).then(res => {
      let filteredApplicants = this.state.vacancyData.applicants.filter(a => a._id !== applicant._id)
      this.setState({
        vacancyData: {
          ...this.state.vacancyData,
          applicants: filteredApplicants
        }
      });
    })
      .catch(err => {
        console.log(err.response.data);
        this.refs.alert.innerText = err.response.data;
        console.log(this.refs.alert);
        this.refs.alert.style.display = "block";
      });
  }

  onClickApprove = (e) => {
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/status`, {
      "userType": this.state.userData.userType,
      "userID": this.state.userData._id,
      "status": "Approved"
    });

    this.setState({
      vacancyData: {
        ...this.state.vacancyData,
        status: 'Approved'
      }
    })
  }

  onClickClose = (e) => {
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/status`, {
      "userType": this.state.userData.userType,
      "userID": this.state.userData._id,
      "status": "Closed"
    });

    this.setState({
      vacancyData: {
        ...this.state.vacancyData,
        status: 'Closed'
      }
    })
  }

  onClickDelete = (e) => {
    //delete has to be called this way because axios does not support body with delete requests
    axios({
      method: 'DELETE',
      url: `http://localhost:3001/api/vacancy/${this.state.postID}/deleteVacancy`,
      data: {
        "userType": this.state.userData.userType,
        "userID": this.state.userData._id
      }
    })

    //need to rereoute to home page somehow now
  }

  onClickReOpen = (e) => {
    axios.put(`http://localhost:3001/api/vacancy/${this.state.postID}/status`, {
      "userType": this.state.userData.userType,
      "userID": this.state.userData._id,
      "status": "Open"
    });

    this.setState({
      vacancyData: {
        ...this.state.vacancyData,
        status: 'Open'
      }
    })
  }

  render() {
    if (!this.state.loaded) return null;
    if (this.state.Edit)
      return (
        <div className="vacancy-post offset-sm-2 col-sm-8 row ">
          <div className="left-of-post col-sm-9">
            <span className="text-muted"> Duration </span>

            <input
              type="text"
              className="form-control"
              name="duration"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.duration + ""}
            />

            <span className="text-muted"> Location </span>

            <input
              type="text"
              className="form-control"
              name="location"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.location + ""}
            />

            <span className="text-muted"> Description </span>
            <input
              type="text-area"
              className="form-control"
              name="description"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.description + ""}
            />
            <span className="text-muted"> Salary </span>
            <input
              type="text"
              className="form-control"
              name="salary"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.salary + ""}
            />
            <span className="text-muted"> Daily Hours </span>
            <input
              type="text"
              className="form-control"
              name="dailyHours"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.dailyHours + ""}
            />
            <span className="text-muted"> City </span>
            <input
              type="text"
              className="form-control"
              name="city"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.city + ""}
            />
            <span className="text-muted"> Name </span>
            <input
              type="text"
              className="form-control"
              name="name"
              onChange={this.handleChange}
              defaultValue={this.state.vacancyData.name + ""}
            />
            <br />
            <button
              className="btn btn-success ctrl-button col-sm-12 "
              onClick={this.onClickSubmit.bind(this)}
            >
              Done
            </button>
          </div>
        </div>
      );
    else
      return (
        <div>
          <div className="vacancy-post offset-sm-2 col-sm-8 row ">
            <div className="left-of-post col-sm-9">
              <div className="vacancy-post-header">
                <p className="text-muted">
                  <i className="fas fa-calendar-day" />{" "}
                  {this.state.vacancyData.postDate}
                </p>
                <h2>{this.state.vacancyData.name}</h2>
                <p>
                  <span className="text-muted">Posted by </span>
                  {this.state.vacancyData.partner.name}
                </p>
                <p className="text-muted">
                  <i className="fas fa-map-marker-alt" />{" "}
                  {this.state.vacancyData.location}, {this.state.vacancyData.city}
                </p>
              </div>
              <div className="vacancy-post-info">
                <h4>Details</h4>
                <p>{this.state.vacancyData.description}</p>
                <br />
                <h4>Daily Hours</h4>
                <p>{this.state.vacancyData.dailyHours}</p>
                <br />
                <h4>Duration</h4>
                <p>{this.state.vacancyData.duration}</p>
                <br />
                <h4>URL</h4>
                <p>{this.state.vacancyData.url}</p>
                <br />
              </div>

              {
                (this.state.vacancyData.status === "Submitted")
                &&
                (this.state.userData.userType === "Admin" || (this.state.userData.userType === "Partner" && this.state.userData._id === this.state.vacancyData.partner._id))
                &&
                <div className="comments-section col-sm-12">
                  <h4>Comments</h4>
                  <CommentsSection userID={this.state.userData._id} userType={this.state.userData.userType} allComments={this.getCommentsSorted()} />

                  <br />
                  <div className="input-group mb-3">
                    <input type="text" name="feedback" className="form-control" onChange={this.handleChange} />
                    <div className="input-group-append">
                      <button className="btn btn-primary" type="button" onClick={this.onClickComment.bind(this)}>Add comment</button>
                    </div>
                  </div>
                </div>
              }

              {
                (this.state.vacancyData.hired.some(emp => emp._id === this.state.userData._id))
                &&
                (this.state.vacancyData.status === 'Closed')
                &&
                <div className="input-group mb-3">
                  <span className="text-muted"> Submit your feedback on this Partner </span>
                  <input type="text" className="form-control" name="feedback" onChange={this.handleChange} />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="button" onClick={this.submitFeedbackMember}>Submit Feedback</button>
                  </div>
                </div>
              }

              {
                (this.state.vacancyData.status === 'Open')
                &&
                (this.state.userData.userType === 'Partner')
                &&
                (this.state.userData._id === this.state.vacancyData.partner._id)
                &&
                <div className="comments-section col-sm-12">
                  <h4>Applicants</h4>
                  {this.state.vacancyData.applicants.map(applicant => (
                    <ApplicantItem lname={applicant.lname} fname={applicant.fname} url={applicant.ProfileURL} key={applicant._id} _id={applicant._id} onClickHire={this.onClickHire} />
                  ))}
                </div>
              }

              {
                (this.state.vacancyData.status === 'Closed')
                &&
                (this.state.userData.userType === 'Partner')
                &&
                (this.state.userData._id === this.state.vacancyData.partner._id)
                &&
                <div className="comments-section col-sm-12">
                  <h4>Hired People that you can submit feedback on:</h4>
                  {this.state.vacancyData.hired.map(emp => (
                    <HiredSubmitFeedbackForm lname={emp.lname} fname={emp.fname} url={emp.ProfileURL} key={emp._id} _id={emp._id} submitFeedbackPartner={this.submitFeedbackPartner} onChange={this.handleChange} name="feedback" />
                  ))}
                </div>
              }

            </div>

            <div className="right-of-post col-sm-3">
              <p className="text-center h3">
                {this.state.vacancyData.salary} EGP
            </p>
              {this.state.userHasApplied ?
                (
                  <button className="btn btn-danger offset-sm-1 col-sm-10 book-button" disabled={this.state.vacancyData.status === "Closed"} onClick={this.onClickCancel}>CANCEL</button>
                ) :
                (
                  <button className="btn btn-outline-success offset-sm-1 col-sm-10 book-button" disabled={this.state.userData.userType !== "Member" || this.state.vacancyData.status === "Closed"} onClick={this.onClickApply}>APPLY NOW</button>
                )
              }
              {
                (this.state.userData.userType === "Partner")
                &&
                (this.state.vacancyData.status === "Submitted")
                &&
                (this.state.vacancyData.partner._id === this.state.userData._id) &&
                <div>
                  <br /><br /> <br />
                  <button className="btn btn-success ctrl-button col-sm-12 " onClick={() => this.setState({ Edit: true })} >Edit</button>
                </div>
              }
              {
                (this.state.userData.userType === "Partner")
                &&
                (this.state.vacancyData.status === "Open")
                &&
                (this.state.vacancyData.partner._id === this.state.userData._id)
                &&
                <div>
                  <br /><br /><br />
                  <button className="btn btn-warning ctrl-button col-sm-12 " onClick={this.onClickClose} >Close Vacancy</button>
                </div>
              }
              {
                (this.state.userData.userType === "Partner")
                &&
                (this.state.vacancyData.status === "Finished")
                &&
                (this.state.vacancyData.partner._id === this.state.userData._id)
                &&
                <div>
                  <br /><br /><br />
                  <button className="btn btn-success ctrl-button col-sm-12 " onClick={this.onClickReOpen}>Re-Open Vacancy</button>
                </div>
              }
              {
                (this.state.userData.userType === "Admin")
                &&
                (this.state.vacancyData.status === "Submitted")
                &&
                <div><br /><br /><br />
                  <button class="btn btn-success ctrl-button col-sm-12 " onClick={this.onClickApprove}>Approve Vacancy</button>
                </div>
              }
              {
                (this.state.userData.userType === "Partner")
                &&
                (this.state.vacancyData.partner._id === this.state.userData._id)
                &&
                (this.state.vacancyData.status === "Submitted")
                &&
                <div><br /><br /><br />
                  <button className="btn btn-danger ctrl-button col-sm-12 " onClick={this.onClickDelete}>Delete Vacancy</button>
                </div>
              }
              <div ref="alert" className="alert alert-danger alert-dev" role="alert" > This is a primary alert—check it out </div>
            </div>
          </div>
        </div>
      );
  }
}


function ApplicantItem(props) {
  return (
    //<Link to={props.url}><h3>{props.fname} {props.lname}</h3></Link>
    <div className="input-group mb-3">
      {/* <Link to={props.ProfileURL}></Link> */}
      <div className="input-group-append">
        <h6>{props.fname} {props.lname}</h6>
        <button className="btn btn-danger" type="button" onClick={() => props.onClickHire(props)}>Hire!</button>
      </div>
    </div>
  )
}

function HiredSubmitFeedbackForm(props) {
  return (
    <div className="input-group mb-3">
      <Link to={props.url}><h6>{props.fname} {props.lname}</h6></Link>

      <input type="text" className="form-control" onChange={props.onChange} name="feedback" />
      <div className="input-group-append">
        <button className="btn btn-primary" type="button" onClick={() => props.submitFeedbackPartner(props)}>Add Feedback!</button>
      </div>
    </div>
  )
}

function CommentsSection(props) {
  return (
    props.allComments.map((comment) => {
      return <div className='comment'>
        <p className="font-weight-bold">{comment.author === props.userID ? ('You') : ((props.userType === 'Admin') ? 'Partner' : 'Lirten Hub')}<span className="text-muted float-right font-weight-lighter">{comment.date}</span></p>
        <p>{comment.text}</p>
      </div>
    })
  )
}

export default VacancyPost
