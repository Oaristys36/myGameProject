import '../styles/footer.css';
import { Link } from 'react-router-dom';


export function Footer () {
    return (
        <footer className="page-footer">
            <div className="footer-links">
                <Link to="/cgu">Conditions Générales</Link>
                <Link to="/confidentials">Confidentalités</Link>
                <Link to="/support">Support</Link>
            </div>
            <div className="footer-copy">
                © {new Date().getFullYear()} MyGameProject. Tous droits réservés.
            </div>
        </footer>
    )
}