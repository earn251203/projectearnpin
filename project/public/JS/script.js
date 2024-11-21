document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const messageElement = document.getElementById("message");

  // Base URL for API calls
  const BASE_URL = "http://localhost:3000";

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);

      try {
        const response = await fetch(`${BASE_URL}/register`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          document.cookie = `username=${result.username}; path=/; max-age=${
            24 * 60 * 60
          }`;
          window.location.href = "home.html";
        } else {
          messageElement.textContent = result.message;
        }
      } catch (error) {
        console.error("Error:", error);
        messageElement.textContent = "An unexpected error occurred";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);

      console.log(formData.get("username"));
      console.log(formData.get("password"));
      

      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          document.cookie = `username=${result.username}; path=/; max-age=${
            24 * 60 * 60
          }`;
          window.location.href = "home.html";
        } else {
          messageElement.textContent = result.message;
        }
      } catch (error) {
        console.error("Error:", error);
        messageElement.textContent = "An unexpected error occurred";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "login.html";
    });
  }

  // Home page user info
  if (window.location.pathname.includes("home.html")) {
    const username = document.cookie.replace(
      /(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (!username) {
      window.location.href = "login.html";
      return;
    }

    fetch(`${BASE_URL}/home?username=${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          document.getElementById("username").textContent = data.username;
          if (data.profileImage) {
            document.getElementById(
              "profileImage"
            ).src = `/profile/${data.profileImage}`;
          }
        } else {
          throw new Error(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        window.location.href = "login.html";
      });
  }
});
