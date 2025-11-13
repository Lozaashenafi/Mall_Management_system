import React from "react";

function Footer() {
  return (
    <>
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} My Website. All rights reserved.
          </p>
          <p className="text-sm">
            Follow us on
            <a
              href="https://twitter.com"
              className="text-indigo-400 hover:underline ml-1"
            >
              Twitter
            </a>
            ,
            <a
              href="https://facebook.com"
              className="text-indigo-400 hover:underline ml-1"
            >
              Facebook
            </a>
            ,
            <a
              href="https://instagram.com"
              className="text-indigo-400 hover:underline ml-1"
            >
              Instagram
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
