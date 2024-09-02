import {Outlet} from "react-router-dom";
import './home.css'
import Carousel from "../components/Carousel.jsx";
export default function Home() {

     return <div className='container'>
         <Carousel/>

         <h1>Tienda E-commerce</h1>
     </div>
}
