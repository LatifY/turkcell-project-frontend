import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.png"
                alt="Turkcell Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-300 text-sm">
              Seyahatlerinizde en ekonomik roaming çözümlerini bulmanıza
              yardımcı oluyoruz.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  to="/trip-planner"
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                >
                  Seyahat Planla
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Destek</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a
                  href="https://maps.app.goo.gl/JYyyhH5mszWKaXfy6"
                  target="_blank"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  📍 Turkcell Tepebaşı Plaza
                </a>
              </li>
              <li>
                <a
                  href="tel:*532"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  📞 532
                </a>
              </li>

              <li>
                <a
                  href="mailto:roaming@turkcell.com.tr"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  ✉️ roaming@turkcell.com.tr
                </a>
              </li>
              <li>
                <a
                  href="https://turkcell.com.tr"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  🌐 turkcell.com.tr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            © 2025 Turkcell. Tüm hakları saklıdır.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 text-sm"
            >
              Gizlilik Politikası
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 text-sm"
            >
              Kullanım Şartları
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 text-sm"
            >
              KVKK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
