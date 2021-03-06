import xmljs from "xml-js";

const THEATRE_AREAS = "https://www.finnkino.fi/xml/TheatreAreas/";
const AREA_DATES = "https://www.finnkino.fi/xml/ScheduleDates/?area=";
const AREA_DATE_SHOWS = "https://www.finnkino.fi/xml/Schedule/?area=";
const EVENT_DETAILS = "https://www.finnkino.fi/xml/Events/?eventID=";

async function fetchTheatreAreas() {
    console.log("Fetch theatres")
    const response = await fetch(THEATRE_AREAS);
    const responseText = await response.text();
    const responseJson = await JSON.parse(xmljs.xml2json(responseText, {compact: true, spaces: 4}));
    const theatreAreas = await responseJson.TheatreAreas.TheatreArea.map(entry => { return { "id": entry.ID._text, "name": entry.Name._text }});
    return theatreAreas;
  };

  async function fetchAreaDate(area) {
    const url = `${AREA_DATES}${area}`;
    const res = await fetch(url);
    const resText = await res.text();
    const resJson = await JSON.parse(xmljs.xml2json(resText, {compact: true, spaces: 4}));
    const dates = await resJson.Dates.dateTime.map(date => date._text)
    return dates;
  }

  async function fetchAreaDateShows(area, date) {
    const dateFull = date.split("T");
    const dateBits = dateFull[0].split("-");
    const url = `${AREA_DATE_SHOWS}${area}&dt=${dateBits[2]}.${dateBits[1]}.${dateBits[0]}`
    console.log(url)
    const res = await fetch(url);
    const resText = await res.text();
    const resJson = await JSON.parse(xmljs.xml2json(resText, {compact: true, spaces: 4}));
    const shows = await resJson.Schedule.Shows.Show.map(show => { return { 
      "showId": show.ID._text,
      "startTime": show.dttmShowStart._text.split("T")[1],
      "eventId": show.EventID._text,
      "movieTitle": show.Title._text
    }})
    return shows;
  }

  async function fetchEventDetails(eventId) {
    if (localStorage.getItem(eventId)) {
      console.log(`Found ${eventId} in local storage`);
      return JSON.parse(localStorage.getItem(eventId));
    } else {
      const url = `${EVENT_DETAILS}${eventId}`;
      const res = await fetch(url);
      console.log(url)
      const resText = await res.text();
      const resJson = await JSON.parse(xmljs.xml2json(resText, {compact: true, spaces: 4}));
      const event = {
        "eventId": resJson.Events.Event.ID._text,
        "title": resJson.Events.Event.Title._text,
        "originalTitle": resJson.Events.Event.OriginalTitle._text,
        "productionYear": resJson.Events.Event.ProductionYear._text,
        "lengthInMinutes": resJson.Events.Event.LengthInMinutes._text,
        "dtLocalRelease": resJson.Events.Event.dtLocalRelease._text,
        "rating": resJson.Events.Event.Rating._text,
        "ratingLabel": resJson.Events.Event.RatingLabel._text,
        "ratingImageUrl": resJson.Events.Event.RatingImageUrl._text,
        "eventType": resJson.Events.Event.EventType._text,
        "genres": resJson.Events.Event.Genres._text,
        "shortSynopsis": resJson.Events.Event.ShortSynopsis._text,
        "synopsis": resJson.Events.Event.Synopsis._text,
        "eventURL": resJson.Events.Event.EventURL._text,
        "images": {
          "eventSmallImagePortrait": resJson.Events.Event.Images.EventSmallImagePortrait?._text || null,
          "eventMediumImagePortrait": resJson.Events.Event.Images.EventMediumImagePortrait?._text || null,
          "eventLargeImagePortrait": resJson.Events.Event.Images.EventLargeImagePortrait?._text || null,
          "eventSmallImageLandscape": resJson.Events.Event.Images.EventSmallImageLandscape?._text || null,
          "eventLargeImageLandscape": resJson.Events.Event.Images.EventLargeImageLandscape?._text || null,
        },
        "videos": {
          "title": resJson.Events.Event.Videos?.EventVideo?.Title._text,
          "location": resJson.Events.Event.Videos?.EventVideo?.Location._text,
          "thumbnailLocation": resJson.Events.Event.Videos?.EventVideo?.ThumbnailLocation._text,
          "mediaResourceSubType": resJson.Events.Event.Videos?.EventVideo?.MediaResourceSubType._text,
          "mediaResourceFormat": resJson.Events.Event.Videos?.EventVideo?.MediaResourceFormat._text,
        },
        ...(Array.isArray(resJson.Events.Event.Cast.Actor) && {"cast": resJson.Events.Event.Cast.Actor.map(actor => {return { "firstName": actor.FirstName._text, "lastName": actor.LastName._text}})}),
        ...(Array.isArray(resJson.Events.Event.Directors.Director) && {"directors": resJson.Events.Event.Directors.Director.map(director => {return { "firstName": director.FirstName._text, "lastName": director.LastName._text}})}),
        ...(!Array.isArray(resJson.Events.Event.Directors.Director) && resJson.Events.Event.Directors.Director && {"directors":  [{ "firstName": resJson.Events.Event.Directors.Director.FirstName._text, "lastName": resJson.Events.Event.Directors.Director.LastName._text}]}),
        ...(Array.isArray(resJson.Events.Event.ContentDescriptors.ContentDescriptor) && {"contentDescriptors":  resJson.Events.Event.ContentDescriptors.ContentDescriptor.map(cd => {return { "name": cd.Name._text, "imageURL": cd.ImageURL._text}})}),
        ...(!Array.isArray(resJson.Events.Event.ContentDescriptors.ContentDescriptor) && resJson.Events.Event.ContentDescriptors.ContentDescriptor && {"contentDescriptors": [{ "name": resJson.Events.Event.ContentDescriptors.ContentDescriptor.Name._text, "imageURL": resJson.Events.Event.ContentDescriptors.ContentDescriptor.ImageURL._text}]}),
      }
      localStorage.setItem(event.eventId, JSON.stringify(event));
      return event;
    }
  }

  export { fetchAreaDate, fetchAreaDateShows, fetchEventDetails, fetchTheatreAreas }