/* eslint-disable no-case-declarations */

const { noteService } = require('../services');

const getNotesCount = async (event) => {
  const {
    account_id,
  } = event.data.identity;

  const notes = await noteService.getListCount({ account_id });
  return notes;
};

module.exports = {
  getNotesCount,
};
