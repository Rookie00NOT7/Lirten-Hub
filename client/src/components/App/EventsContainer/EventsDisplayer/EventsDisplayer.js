import React from 'react'
import './EventCard.css'
import axios from 'axios'
import { NavLink } from 'react-router-dom'


const EventsDisplayer = ({events}) => {
  const goToPost = async (url) => {
    console.log(url)
    var post =(url) ?await axios.get("http://localhost:3001"+url):'none';
    console.log(post)
    //should display event post page
  }
  const eventsList = events.length ? (
        events.map(ev => {
            return(
                <div key={ev._id}>
                  <div className="card eventCard">
                    {/* <img src='.../public/assets/a.jpg' className="card-img-top" alt="event photo"/> */}
                      <div className="card-body">
                        <h5 className="card-title">{ev.name}</h5>
                        <p className="card-text sample-text">{ev.description && ev.description.length > 100?ev.description.substring(0, 100)+". . .":ev.description}</p>
                        <span className="card-text"><small className="text-muted">{ev.eventDate?new Date(ev.eventDate).toLocaleDateString():'no date specified'}</small></span>
                        <NavLink to={`/events/${ev._id}`} className="btn btn-primary">see more</NavLink>

                      </div>
                  </div>
                </div>
            )
        })
    ):(
    <p className="center">no events to show</p>
    );
    return (
      <div className='card-group'>
        {eventsList}
      </div>
    )
}

export default EventsDisplayer
