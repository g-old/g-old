
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}


class PollingMode {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.threshold_ref = data.threshold_ref;
    this.unipolar = data.unipolar;
    this.with_statements = data.with_statements;
  }
  static async gen(viewer, id, { pollingModes }) {
    const data = await pollingModes.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new PollingMode(data) : null;
  }
}

export default PollingMode;
