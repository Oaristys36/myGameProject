import { Link } from "react-router-dom";
import "../styles/topbar.css";
import { FaGithub, FaDiscord, FaFacebook} from 'react-icons/fa'
export function TopBar() {
    return( 
        <div className="top-bar">
            <div className="top-bar-left">

            </div>
            <div className="top-bar-right">
                <Link to="/about" className="top-link">Qui sommes-nous ?</Link>
                <a href="https://github.com" className="top-icon" title="GitHub" target="_blank" rel="noopener noreferrer">
                    <FaGithub />
                </a>
                <a href="https://discord.com" className="top-icon" title="Discord" target="_blank" rel="noopener noreferrer">
                    <FaDiscord />
                </a>
                <a href="https://facebook.com" className="top-icon" title="Facebook" target="_blank" rel="noopener noreferrer">
                    <FaFacebook />
                </a>
            </div>
        </div>
    )
}