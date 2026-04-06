import Api from "./Api";

const userService = {
// GET /api/users/me ← NUEVO
  getMe: () =>
    Api.get("/users/me"),
  // POST /api/users
  create: (data) =>
    Api.post("/users", data),

  // PUT /api/users/profile
  updateProfile: (data) =>
    Api.put("/users/profile", data),

  
};


export default userService;