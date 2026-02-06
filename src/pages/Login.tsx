import PersonIcon from '@mui/icons-material/Person';
import TextInput from "../components/TextInput.tsx";
import PasswordInput from "../components/PasswordInput.tsx";

function LoginPage() {

    return (
        <div className="main-container flex flex-col justify-center items-center h-screen font-inter gap-12">
            <div className="flex flex-col gap-2">
                <div className="login-icon flex justify-center items-center">
                    <PersonIcon fontSize="inherit" color="inherit" className="bg-black rounded-2xl p-2 shadow-xl" style={{fontSize: "4rem", color: "white"}} />
                </div>
                <div className="flex flex-col justify-center items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                    <h1 className="text-4xl font-medium">Bentornato</h1>
                    <h3 className="text-black/50">Inserisci le tue credenziali per accedere</h3>
                </div>
            </div>
            <form method="post" action="/login" className="bg-[#fcfdfe] w-[30vw] max-w-[660px] shadow-xl rounded-2xl p-8 flex flex-col">
                <label className="ml-2 opacity-80">Email</label>
                <TextInput id="email" name="email" required /><br/>

                <div className="flex justify-between items-center ml-2 opacity-80">
                    <label htmlFor="password">Password</label>
                    <a href="/forgot-password" className="text-sm text-black/50 hover:underline mr-2">
                        Recupera password
                    </a>
                </div>
                <PasswordInput id="password" name="password" required /><br/>

                <div className="w-full flex justify-center items-center">
                    <button type="submit" className="bg-black text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-black/80 disabled:bg-black/20 disabled:cursor-not-allowed" disabled={true}>
                        Login
                    </button>
                </div>
            </form>

        </div>
    )
}

export default LoginPage;