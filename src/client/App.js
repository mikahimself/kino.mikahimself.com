import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import io from "socket.io-client";
import { fetchAreaDate, fetchAreaDateShows, fetchEventDetails, fetchTheatreAreas } from './services/dataManager';

const ENDPOINT = "http://localhost:3030";

function App() {
  const [reply, setReply] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShow, setSelectedShow] = useState("");
  const [showDetails, setShowDetails] = useState("");
  const [shows, setShows] = useState([]);
  const [dates, setDates] = useState([]);
  const db = useRef(null)
  
  const socket = io(ENDPOINT);
  socket.on("connection", () => {
    console.log("Connected to server.")
  });

  useEffect(() => {
    let lsAreas = JSON.parse(window.localStorage.getItem("areas"));
    db.current =  indexedDB.open("events");
    db.current.onsuccess = (e) => {
      console.log("success")
    }

    if (!lsAreas) {
        
      
      async function getAreas() {

        const areaData = fetchTheatreAreas();
        window.localStorage.setItem("areas", JSON.stringify(await areaData));
        setAreas(await areaData);
      }
      getAreas();
    }
    else {
      let lsAreas = JSON.parse(window.localStorage.getItem("areas"));
      setAreas(lsAreas);
    }
  }, []);

  const getAreaDate = async(area) => {
    setDates(await fetchAreaDate(area));
  }

  const getAreaShows = async(date) => {
    setShows(await fetchAreaDateShows(selectedArea, date))
  }

  const getEventDetails = async(eventId) => {
    setShowDetails(await fetchEventDetails(eventId))
  }

  const updateSelectedArea = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const selection = e.target.options[selectedIndex].getAttribute('data-id');
    setSelectedArea(selection);
    setSelectedDate("");
    getAreaDate(selection);
  }

  const updateDates = (e) => {
    setSelectedDate(e.target.value);
    getAreaShows(e.target.value);
  }

  const updateShows = (e) => {
    console.log("Selected: " + e.target.value)
    const selectedIndex = e.target.options.selectedIndex;
    const selection = e.target.options[selectedIndex].getAttribute('data-title');
    const eventId = e.target.options[selectedIndex].getAttribute('data-id');
    setSelectedShow(selection)
    getEventDetails(eventId);
  }

  return (
    <div className="App">
      <h1>It sorta works.</h1>
      {reply && <p>Reply from server: {reply}</p>}
      {areas && (
        <select onChange={updateSelectedArea} value={selectedArea}>
          <option value="null">Select theatre</option>
          {areas.map(area => <option key={area.id} value={area.id} data-id={area.id}>{area.name}: {area.id}</option>) }
        </select>
      )}
      {dates && (
        <select onChange={updateDates} value={selectedDate}>
          <option value="null">Select date</option>
          {dates.map(date => <option key={date} value={date}>{date}</option>)}
        </select>  
      )}
      {shows && (
        <select onChange={updateShows} value={selectedShow.movieTitle}>
          <option value="null">Select show</option>
          {shows.map(show => <option key={show.showId} value={show} data-title={show.movieTitle} data-id={show.eventId}>{show.movieTitle} - {show.startTime}</option>)}
        </select>  
      )}
      {showDetails && (
        <>
        <p>{ JSON.stringify(showDetails) }</p>
        <button>Like</button>
        <button>Hate</button>
        </>
      )}
    </div>
  );
}

export default App;
