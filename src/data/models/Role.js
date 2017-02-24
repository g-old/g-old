
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  console.log('CHECK');
  console.log(viewer);
  console.log(data);
  return viewer.role === data.type || viewer.role === 'admin';
}


class Role {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
  }
  static async gen(viewer, id, { roles }) {
    const data = await roles.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Role(data) : null;
  }
}

export default Role;
