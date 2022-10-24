const CANCEL = {
  name: 'cancel',
  preset_key: 'common_cancel_btn',
  is_default: 'true', // by default false
  recovery_param: {},
};

const getDeleteRecoveryOptions = ({ noteId }, cancel = true) => {
  const options = [
    {
      name: 'force',
      preset_key: 'common_cancel_btn',
      is_default: 'false',
      recovery_param: {
        method: 'delete',
        path: `/notes/${noteId}`,
        params: 'force_update=true',
        body: '',
      },
    },
  ];

  if (cancel) {
    options.push(CANCEL);
  }

  return options;
};

module.exports = {
  getDeleteRecoveryOptions,
};
