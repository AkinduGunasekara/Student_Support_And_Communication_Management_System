import {Route, Routes } from "react-router";

import GKTicketCreate from './ticketRaising/gkTicketCreate.jsx';
import GKTicketView from './ticketRaising/gkTicketView.jsx';
import GKTicketUpdate from './ticketRaising/gkTicketUpdate.jsx';
import GKTicketDelete from './ticketRaising/gkTicketDelete.jsx';
import GkAdminViewTicket from "./ticketRaising/gkAdminViewTicket.jsx";

const App = () =>{
    return(
        <div className="p-4">
          <Routes>
            <Route path="/raise-ticket" element={<GKTicketCreate />} />
            <Route path="/view-ticket" element={<GKTicketView />} />
            <Route path="/update-ticket/:id" element={<GKTicketUpdate />} />
            <Route path="/delete-ticket/:id" element={<GKTicketDelete />} />
            <Route path="/reply" element={<GkAdminViewTicket />} />

          </Routes>
        </div>
  );
};

export default App;
