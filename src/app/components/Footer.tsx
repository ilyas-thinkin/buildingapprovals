import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-column footer-brand">
            <a href="/" className="footer-logo">
              <img src="/images/Building Approvals OG Logo.png" alt="Building Approvals" />
            </a>
            <p className="footer-description">
              Your trusted partner for seamless building approvals across all Dubai authorities.
              Fast-track your project with our expert approval management services.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.5195 0H1.47656C0.660156 0 0 0.644531 0 1.44141V18.5547C0 19.3516 0.660156 20 1.47656 20H18.5195C19.3359 20 20 19.3516 20 18.5586V1.44141C20 0.644531 19.3359 0 18.5195 0ZM5.93359 17.043H2.96484V7.49609H5.93359V17.043ZM4.44922 6.19531C3.49609 6.19531 2.72656 5.42578 2.72656 4.47656C2.72656 3.52734 3.49609 2.75781 4.44922 2.75781C5.39844 2.75781 6.16797 3.52734 6.16797 4.47656C6.16797 5.42187 5.39844 6.19531 4.44922 6.19531ZM17.043 17.043H14.0781V12.4023C14.0781 11.2969 14.0586 9.87109 12.5352 9.87109C10.9922 9.87109 10.7578 11.0781 10.7578 12.3242V17.043H7.79297V7.49609H10.6406V8.80078H10.6797C11.0742 8.05078 12.043 7.25781 13.4844 7.25781C16.4883 7.25781 17.043 9.23438 17.043 11.8047V17.043Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 1.80176C12.6699 1.80176 12.9863 1.8125 14.0391 1.85938C15.0156 1.90234 15.543 2.06641 15.8945 2.20313C16.3594 2.38281 16.6953 2.60156 17.043 2.94922C17.3945 3.30078 17.6094 3.63281 17.7891 4.09766C17.9258 4.44922 18.0898 4.98047 18.1328 5.95312C18.1797 7.00977 18.1904 7.32617 18.1904 9.99219C18.1904 12.6621 18.1797 12.9785 18.1328 14.0313C18.0898 15.0078 17.9258 15.5352 17.7891 15.8867C17.6094 16.3516 17.3906 16.6875 17.043 17.0352C16.6914 17.3867 16.3594 17.6016 15.8945 17.7813C15.543 17.918 15.0117 18.082 14.0391 18.125C12.9824 18.1719 12.666 18.1826 10 18.1826C7.33008 18.1826 7.01367 18.1719 5.96094 18.125C4.98438 18.082 4.45703 17.918 4.10547 17.7813C3.64063 17.6016 3.30469 17.3828 2.95703 17.0352C2.60547 16.6836 2.39063 16.3516 2.21094 15.8867C2.07422 15.5352 1.91016 15.0039 1.86719 14.0313C1.82031 12.9746 1.80957 12.6582 1.80957 9.99219C1.80957 7.32227 1.82031 7.00586 1.86719 5.95312C1.91016 4.97656 2.07422 4.44922 2.21094 4.09766C2.39063 3.63281 2.60938 3.29688 2.95703 2.94922C3.30859 2.59766 3.64063 2.38281 4.10547 2.20313C4.45703 2.06641 4.98828 1.90234 5.96094 1.85938C7.01367 1.8125 7.33008 1.80176 10 1.80176ZM10 0C7.28516 0 6.94531 0.0107422 5.87695 0.0576172C4.8125 0.104492 4.08594 0.277344 3.45313 0.523438C2.79297 0.78125 2.23438 1.12109 1.67969 1.67969C1.12109 2.23438 0.78125 2.79297 0.523438 3.44922C0.277344 4.08594 0.104492 4.8086 0.0576172 5.87305C0.0107422 6.94531 0 7.28516 0 10C0 12.7148 0.0107422 13.0547 0.0576172 14.123C0.104492 15.1875 0.277344 15.9141 0.523438 16.5469C0.78125 17.207 1.12109 17.7656 1.67969 18.3203C2.23438 18.875 2.79297 19.2188 3.44922 19.4727C4.08594 19.7188 4.8086 19.8916 5.87305 19.9385C6.94141 19.9854 7.28125 19.9961 9.99609 19.9961C12.7109 19.9961 13.0508 19.9854 14.1191 19.9385C15.1836 19.8916 15.9102 19.7188 16.543 19.4727C17.1992 19.2188 17.7578 18.875 18.3125 18.3203C18.8672 17.7656 19.2109 17.207 19.4648 16.5508C19.7109 15.9141 19.8838 15.1914 19.9307 14.127C19.9775 13.0586 19.9883 12.7188 19.9883 10.0039C19.9883 7.28906 19.9775 6.94922 19.9307 5.88086C19.8838 4.81641 19.7109 4.08984 19.4648 3.45703C19.2188 2.79297 18.8789 2.23438 18.3203 1.67969C17.7656 1.125 17.207 0.78125 16.5508 0.527344C15.9141 0.28125 15.1914 0.108398 14.127 0.0615234C13.0547 0.0107422 12.7148 0 10 0Z" fill="currentColor"/>
                  <path d="M10 4.86328C7.16406 4.86328 4.86328 7.16406 4.86328 10C4.86328 12.8359 7.16406 15.1367 10 15.1367C12.8359 15.1367 15.1367 12.8359 15.1367 10C15.1367 7.16406 12.8359 4.86328 10 4.86328ZM10 13.332C8.16016 13.332 6.66797 11.8398 6.66797 10C6.66797 8.16016 8.16016 6.66797 10 6.66797C11.8398 6.66797 13.332 8.16016 13.332 10C13.332 11.8398 11.8398 13.332 10 13.332Z" fill="currentColor"/>
                  <path d="M16.5391 4.66016C16.5391 5.32422 16.0039 5.85547 15.3438 5.85547C14.6797 5.85547 14.1484 5.32031 14.1484 4.66016C14.1484 3.99609 14.6836 3.46484 15.3438 3.46484C16.0039 3.46484 16.5391 4 16.5391 4.66016Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.9027 8.46897L19.3482 0H17.5838L11.119 7.35256L5.95547 0H0L7.8082 11.1196L0 20H1.76443L8.59152 12.2348L14 20H19.9555L11.9027 8.46897ZM9.48608 11.2173L8.69495 10.1101L2.40018 1.29967H5.11025L10.1902 8.40994L10.9813 9.51718L17.5847 18.7594H14.8746L9.48608 11.2173Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/projects">Projects</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-title">Our Services</h3>
            <ul className="footer-links">
              <li><a href="/services/civil-defense">Civil Defense Approvals</a></li>
              <li><a href="/services/dewa">DEWA Approval</a></li>
              <li><a href="/services/municipality">Dubai Municipality</a></li>
              <li><a href="/services/emaar">Emaar Approval</a></li>
              <li><a href="/services/nakheel">Nakheel Approval</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-title">Get In Touch</h3>
            <ul className="footer-contact">
              <li>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.75 7.5C15.75 12.75 9 17.25 9 17.25C9 17.25 2.25 12.75 2.25 7.5C2.25 5.70979 2.96116 3.9929 4.22703 2.72703C5.4929 1.46116 7.20979 0.75 9 0.75C10.7902 0.75 12.5071 1.46116 13.773 2.72703C15.0388 3.9929 15.75 5.70979 15.75 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Business Bay, Dubai, UAE</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 12.6V14.85C16.5008 15.0565 16.4573 15.2608 16.3724 15.4494C16.2875 15.638 16.1631 15.8065 16.007 15.9436C15.8509 16.0808 15.6666 16.1835 15.4664 16.2448C15.2663 16.3062 15.0549 16.3248 14.8463 16.2993C12.5284 16.0267 10.3084 15.2389 8.3625 13.9988C6.5438 12.8679 5.00351 11.3276 3.8725 9.50878C2.62875 7.55272 1.84042 5.32054 1.57125 2.99128C1.54583 2.78353 1.56427 2.57303 1.62518 2.37357C1.68608 2.17411 1.78808 1.99034 1.92439 1.83459C2.0607 1.67885 2.22827 1.5545 2.41591 1.46932C2.60355 1.38414 2.80701 1.34008 3.0125 1.34003H5.2625C5.64613 1.33624 6.01713 1.47502 6.30253 1.7299C6.58794 1.98479 6.76621 2.33669 6.80375 2.71753C6.87368 3.47872 7.02817 4.22936 7.265 4.95628C7.3701 5.2707 7.38283 5.60916 7.30186 5.93073C7.22088 6.25231 7.04963 6.54347 6.80875 6.77003L5.8925 7.68628C6.94269 9.55669 8.48206 11.0961 10.3525 12.1463L11.2688 11.23C11.4953 10.9891 11.7865 10.8178 12.1081 10.7369C12.4296 10.6559 12.7681 10.6686 13.0825 10.7738C13.8094 11.0106 14.5601 11.1651 15.3213 11.235C15.7066 11.2729 16.0623 11.4547 16.3183 11.7449C16.5743 12.0351 16.7113 12.4121 16.7038 12.7988L16.5 12.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="tel:+97143886600">+971 4 388 6600</a>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="mailto:info@buildingapprovals.ae">info@buildingapprovals.ae</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Building Approvals. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="/privacy">Privacy Policy</a>
              <span className="divider">•</span>
              <a href="/terms">Terms of Service</a>
              <span className="divider">•</span>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
