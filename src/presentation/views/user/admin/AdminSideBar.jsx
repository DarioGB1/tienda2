import React, {Component} from 'react';
import './admin.css'
import Sidebar from "../Sidebar.jsx";
import {useParams} from "react-router-dom";
import CrudProductos from "./CrudProductos.jsx";
import CrudEmpleados from "./CrudEmpleados.jsx";
import AdminInfo from "./AdminInfo.jsx";
import Dashboard from "./Dashboard.jsx";
import AddProductForm from "../../Products/addProductform.jsx";
import EditProductForm from '../../Products/editProductform.jsx';
import UserForm from "./UserForm.jsx";
import CrudCategoria from "./CrudCategoria.jsx";
import CategoriaTable from "./CategoriaTable.jsx";

// eslint-disable-next-line react/prop-types
export default function AdminSideBar({productos, categorys}) {
    const {activepage} = useParams()

        return (
            <div>
                <div className="admin-sidebar">
                    <div className="left">
                        <Sidebar activepage={activepage} productos={productos}/>
                    </div>
                    <div className="right">
                        {activepage === 'crud-productos' && <CrudProductos productos={productos} /> }
                        {activepage === 'crud-empleados' && <CrudEmpleados/> }
                        {activepage === 'dashboard' && <Dashboard/> }
                        {activepage === 'add-product' && <AddProductForm/>}
                        {activepage === 'edit-product' && <EditProductForm/>}
                        {activepage === 'AdminInfo' && <AdminInfo/>}
                        {activepage === 'add-empleado' && <UserForm/>  }
                        {activepage === 'addcategory' && <CrudCategoria/>  }
                        {activepage === 'categoria' && <CategoriaTable productos={productos} categorys={categorys} />  }
                    </div>
                </div>
            </div>
        );

}

