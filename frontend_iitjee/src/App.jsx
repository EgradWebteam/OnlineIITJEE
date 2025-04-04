import React, {Suspense} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom";
const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE'));

function App() {
  return (
   <Suspense>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPageIITJEE />} />
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}

export default App
