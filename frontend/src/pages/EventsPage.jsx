import React from 'react';
import { useSelector } from 'react-redux';
import EventCard from '../components/Events/EventCard';
import Header from '../components/Layout/Header';
import Loader from '../components/Layout/Loader';

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          <div className="w-full  grid  mt-4">
            {allEvents.length !== 0 && (
              <EventCard data={allEvents && allEvents[0]} />
            )}

            {allEvents?.length === 0 && (
              <h1 className="text-center text-lg 800px:text-2xl mt-4">
                No Active Events!
              </h1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EventsPage;
