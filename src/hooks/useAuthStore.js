import { useDispatch, useSelector } from 'react-redux'
import calendarApi from '../api/calendarApi'
import { checking, clearErrorMessage, onLogin, onLogout, onLogoutCalendar } from '../store'
export const useAuthStore = () => {

    const dispatch = useDispatch()
    const { status, user, errorMessage } = useSelector(state => state.auth)

    const startLogin = async ({ loginEmail: email, loginPassword: password }) => {
        dispatch(checking())
        try {
            const { data } = await calendarApi.post('/auth', { email, password })
            localStorage.setItem('token', data.token)
            localStorage.setItem('token-init-date', new Date().getTime())
            dispatch(onLogin({ name: data.name, uid: data.uid }))

        } catch (error) {
            console.log(error)
            dispatch(onLogout('Credenciales incorrectas'))
            setTimeout(() => {
                dispatch(clearErrorMessage())
            }, 1000);
        }
    }

    const startRegister = async ({ registerName: name, registerEmail: email, registerPassword: password }) => {
        try {

            const { data } = await calendarApi.post('/auth/new', { name, email, password })
            localStorage.setItem('token', data.token)
            localStorage.setItem('token-init-date', new Date().getTime())
            dispatch(onLogin({ name: data.name, uid: data.uid }))

        } catch (error) {
            const { response } = error
            const { data } = response
            const { msg } = data.errors?.name || data.errors?.password || data.errors?.email || { msg: data.message }
            dispatch(onLogout(msg))
            setTimeout(() => {
                dispatch(clearErrorMessage())
            }, 1000);
        }
    }
    const checkAuthToken = async () => {
        const token = localStorage.getItem('token')
        if (!token) return dispatch(onLogout())
        try {
            const { data } = await calendarApi.get('/auth/renew')
            //todo: localstorage function
            localStorage.setItem('token', data.token)
            localStorage.setItem('token-init-date', new Date().getTime())
            dispatch(onLogin({ name: data.name, uid: data.uid }))
        } catch (error) {
            localStorage.clear()
            dispatch(onLogout())
        }
    }

    const startLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('token-init-date')
        dispatch(onLogoutCalendar())
        dispatch(onLogout())


    }

    return {
        errorMessage,
        status,
        user,

        startLogin,
        startRegister,
        checkAuthToken,
        startLogout


    }
}