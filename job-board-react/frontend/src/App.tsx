import { Link, Route, Routes } from "react-router-dom";
import { JobList } from "./pages/JobList";
import { PostJob } from "./pages/PostJob";

function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/">Job List</Link>
        <Link to="/post">Post a Job</Link>
      </nav>
      <Routes>
        <Route path="/" element={<JobList />} />
        <Route path="/post" element={<PostJob />} />
      </Routes>
    </>
  );
}

export default App;
