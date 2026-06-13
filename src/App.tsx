import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MapView from "@/pages/MapView";
import DiseaseList from "@/pages/DiseaseList";
import DiseaseDetail from "@/pages/DiseaseDetail";
import DiseaseForm from "@/pages/DiseaseForm";
import BridgeList from "@/pages/BridgeList";
import BridgeDetail from "@/pages/BridgeDetail";
import BridgeForm from "@/pages/BridgeForm";
import InspectionList from "@/pages/InspectionList";
import InspectionForm from "@/pages/InspectionForm";
import InspectionDetail from "@/pages/InspectionDetail";
import MaintenanceList from "@/pages/MaintenanceList";
import MaintenanceForm from "@/pages/MaintenanceForm";
import MaintenanceDetail from "@/pages/MaintenanceDetail";
import PatrolList from "@/pages/PatrolList";
import PatrolDetail from "@/pages/PatrolDetail";
import PatrolForm from "@/pages/PatrolForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        
        <Route path="/bridges" element={<BridgeList />} />
        <Route path="/bridges/new" element={<BridgeForm />} />
        <Route path="/bridges/:id" element={<BridgeDetail />} />
        <Route path="/bridges/:id/edit" element={<BridgeForm />} />
        
        <Route path="/inspections" element={<InspectionList />} />
        <Route path="/inspections/new" element={<InspectionForm />} />
        <Route path="/inspections/:id" element={<InspectionDetail />} />
        <Route path="/inspections/:id/edit" element={<InspectionForm />} />
        
        <Route path="/diseases" element={<DiseaseList />} />
        <Route path="/diseases/new" element={<DiseaseForm />} />
        <Route path="/diseases/:id" element={<DiseaseDetail />} />
        <Route path="/diseases/:id/edit" element={<DiseaseForm />} />
        
        <Route path="/maintenances" element={<MaintenanceList />} />
        <Route path="/maintenances/new" element={<MaintenanceForm />} />
        <Route path="/maintenances/:id" element={<MaintenanceDetail />} />
        <Route path="/maintenances/:id/edit" element={<MaintenanceForm />} />
        
        <Route path="/patrols" element={<PatrolList />} />
        <Route path="/patrols/new" element={<PatrolForm />} />
        <Route path="/patrols/:id" element={<PatrolDetail />} />
        <Route path="/patrols/:id/edit" element={<PatrolForm />} />
      </Routes>
    </Router>
  );
}
