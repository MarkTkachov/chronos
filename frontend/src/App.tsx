import { Provider } from "react-redux";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import { RestorePasswordPage } from "./components/auth/RestorePasswordPage";
import { HomePage } from "./components/calendar/HomePage";
import { store } from "./redux/store";
import LoginRequire from "./components/common/LoginRequire";


const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/reset-password/:token',
        element: <RestorePasswordPage />,
    },
    {
        path: '/',
        element: <LoginRequire><HomePage /></LoginRequire> ,
    },
    {
        path: '/*',
        element: <Navigate to={'/'} /> ,
    },
])

function App() {


    return (
        <>
            <Provider store={store} >
                <RouterProvider router={router} />
            </Provider>
        </>
    );
}

export default App;
