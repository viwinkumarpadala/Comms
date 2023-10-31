import {BrowserRouter, Route, Routes} from "react-router-dom";

import Client from "./pages/client"
import Signin from "./pages/signin"
import SendQuery from "./pages/sendQuery";

function App() {
    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Signin/>}/>
                <Route path="/agent" element={<Client/>}/>
                <Route path="/sendQuery" element={<SendQuery/>}/>
                <Route path="*" element={<h1>Not Found</h1>}/>
            </Routes>
        </BrowserRouter>


    );
}

export default App;
