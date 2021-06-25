import './App.css';
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import xmljs from "xml-js";

const ENDPOINT = "http://localhost:3030";

function App() {
  const [reply, setReply] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null)
  const [dates, setDates] = useState([]);
  const socket = io(ENDPOINT);
  socket.on("connection", () => {
    console.log("Connected to server.")
  });

  // useEffect(() => {
  //   async function getShowsForArea(area) {
  //     fetchAreaDate
  //   }
  // }, [selectedArea])

  useEffect(() => {
    let lsAreas = JSON.parse(window.localStorage.getItem("areas"));
    async function fetchAreaDates(areas) {
      for (let area of areas) {
        let dates = await fetchAreaDate(area.id);
        // console.log(dates)
        area.dates = dates;
      }
    }

    if (!lsAreas) {
    async function fetchTheatreAreas() {
      console.log("Fetch theatres")
      let areaData = await fetch("https://www.finnkino.fi/xml/TheatreAreas/")
      .then(response => response.text())
      .then(data => JSON.parse(xmljs.xml2json(data, {compact: true, spaces: 4})))
      .then(data => data.TheatreAreas.TheatreArea.map(entry => { return { "id": entry.ID._text, "name": entry.Name._text }}))
      setAreas(await areaData);
      // fetchAreaDates(await areaData);
      window.localStorage.setItem("areas", JSON.stringify(await areaData))
    };
    fetchTheatreAreas();}
    else {
      console.log("use local storage")
      let lsAreas = JSON.parse(window.localStorage.getItem("areas"));
      fetchAreaDates(lsAreas);
      // for (let area of lsAreas) {
      //   let dates = fetchAreaDate(area.id);
      //   console.log(dates)
      // }
      //console.log(lsAreas)
      setAreas(lsAreas);
      //window.localStorage.setItem("areas", JSON.stringify("poop"))
      //window.localStorage.setItem("areas", JSON.stringify(lsAreas))
      //console.log(dates)
      //window.localStorage.setItem("areas", JSON.stringify(dates))
      //fetchAreaDate({id: 1038})
    }
  }, []);



  const fetchAreaDate = async(area) => {
    
    let url = `https://www.finnkino.fi/xml/ScheduleDates/?area=${area}`;
    let res = await fetch(url);
    let resText = await res.text();
    let resJson = await JSON.parse(xmljs.xml2json(resText, {compact: true, spaces: 4}));
    let dates = await resJson.Dates.dateTime.map(date => date._text)
    setDates(await dates);
    return dates;
  }

  const updateSelectedArea = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const selection = e.target.options[selectedIndex].getAttribute('data-id');
    setSelectedArea(selection);
    fetchAreaDate(selection);
  }

  const updateDates = () => {
    console.log("Date change")
  }

  return (
    <div className="App">
      <h1>It sorta works.</h1>
      {reply && <p>Reply from server: {reply}</p>}
      {areas && (
        <select onChange={updateSelectedArea} >
          <option value="null">Select theatre</option>
          {areas.map(area => <option key={area.id} data-id={area.id}>{area.name}: {area.id}</option>) }
        </select>
      )}
      {dates && (
        <select onChange={updateDates}>
          <option value="null">Select date</option>
          {dates.map(date => <option key={date}>{date}</option>)}
        </select>  
      )

      }

    </div>
  );
}

export default App;
