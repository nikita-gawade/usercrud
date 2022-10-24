/* eslint-disable no-shadow */
const { error, success } = require('@yapsody/lib-handlers');
const { getToDelete, checkChanges } = require('@yapsody/lib-utils');
const config = require('../config/note.config.json');
const {
  getListValidation, getId, addNoteValidation, updateNoteValidation, recoveryParamsValidation, updateNotesValidation,
} = require('../validations');
const { noteService } = require('../services');

const getListCount = async (req, res, next) => {
  const reqData = { ...req.query };
  if (reqData.ids) {
    reqData.ids = reqData.ids.split(';');
  }
  try {
    const validatedReqData = await getListValidation.validateAsync(reqData);
    const {
      status,
      search,
      ids,
    } = validatedReqData;
    const count = await noteService.getListCount({
      account_id: req.account.id,
      status,
      search,
      ids,
    });
    return success.handler({ count }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const getConfig = async (req, res, next) => success.handler({ config }, req, res, next);

const getList = async (req, res, next) => {
  const reqData = { ...req.query };
  if (reqData.ids) {
    reqData.ids = reqData.ids.split(';');
  }
  try {
    const validatedReqData = await getListValidation.validateAsync(reqData);
    const {
      page_no,
      page_size,
      status,
      sort_by,
      sort_order,
      search,
      ids,
    } = validatedReqData;
    const notes = await noteService.getList({
      account_id: req.account.id,
      page_no,
      page_size,
      status,
      sort_by,
      sort_order,
      search,
      ids,
    });
    return success.handler({ notes }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const getOne = async (req, res, next) => {
  const { noteId } = req.params;
  try {
    const id = await getId.validateAsync(noteId);
    const note = await noteService.getOne({
      account_id: req.account.id,
      id,
    });
    return success.handler({ note }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const addOne = async (req, res, next) => {
  const reqBody = req.body;
  try {
    const validatedReqData = await addNoteValidation.validateAsync(reqBody);
    const {
      name,
      description,
    } = validatedReqData;
    const note = await noteService.addOne({
      account_id: req.account.id,
      name,
      description,
    });
    return success.handler({ note }, req, res, next);
  } catch (err) {
    switch (err.name) {
      case 'SequelizeUniqueConstraintError':
        err.custom_key = 'NoteConflict';
        err.message = `Note with name ${req.body.name} already exists`;
        break;
      default:
        break;
    }
    return error.handler(err, req, res, next);
  }
};

const updateOne = async (req, res, next) => {
  const { noteId } = req.params;
  const enableFlag = req.query.enable;
  try {
    const id = await getId.validateAsync(noteId);
    const {
      name,
      description,
      enable,
      version,
    } = await updateNoteValidation.validateAsync({ ...req.body, enable: enableFlag });

    if (enable === true) {
      const item = await noteService.enableOne({
        id,
        account_id: req.account.id,
      });

      return success.handler({ note: item }, req, res, next);
    }

    if (enable === false) {
      const item = await noteService.disableOne({
        id,
        account_id: req.account.id,
      });
      return success.handler({ note: item }, req, res, next);
    }

    let item = await noteService.getOne({
      account_id: req.account.id,
      id,
    });

    // eslint-disable-next-line no-unused-vars
    const difference = checkChanges({
      name,
      description,
      version,
    }, item);

    if (item.version !== version) {
      error.throwPreconditionFailed({
        message: 'Object has been updated since you last opened, do you want to reload the new version or overwrite existing changes done?',
        difference,
      });
    }

    item.name = name !== undefined ? name : item.name;
    item.description = description !== undefined ? description : item.description;
    item.version = version + 1;

    item = await item.save();

    // Send difference in event data. Difference will be the changes made in the resource
    // eventUtils.publishEvent(EventTypes.GetAccountAddressesCount, req, { note, difference });
    return success.handler({ note: item }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const updateNotes = async (req, res, next) => {
  const reqBody = req.body;
  const account_id = req.account.id;
  try {
    let notesWithIds = [];
    const validatedReqData = await updateNotesValidation.validateAsync(reqBody);
    const { notes } = validatedReqData;
    if (notes[0]) {
      notes.forEach((note) => {
        if (note.id) {
          notesWithIds.push(note.id);
        }
      });
      notesWithIds = [...new Set(notesWithIds)].sort();
    } else {
      const deletedNotes = await noteService.deleteAllNotes({ account_id });
      return success.handler({ notes: deletedNotes }, req, res, next);
    }

    if (notesWithIds[0]) {
      const notesLength = notesWithIds.length;
      const count = await noteService.getListCount({
        account_id,
        ids: notesWithIds,
      });

      if (count !== notesLength) {
        throw error.throwPreconditionFailed({ message: 'invalid note' });
      }
      const oldNotes = await noteService.getList({
        account_id,
        page_no: 1,
        page_size: 100,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      let oldNotsIds = oldNotes.map((note) => note.id);
      oldNotsIds = [...new Set(oldNotsIds)].sort();
      const {
        toDelete,
      } = getToDelete.arrayOfIntegers({
        newArray: notesWithIds,
        sourceArray: oldNotsIds,
      });
      if (toDelete[0]) {
        await noteService.deleteNotes({
          account_id: req.account.id,
          ids: toDelete,
        });
      }
    }

    const updatedNotes = await noteService.updateNotes({
      account_id: req.account.id,
      notes,
    });
    return success.handler({ notes: updatedNotes }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const deleteOne = async (req, res, next) => {
  const { noteId } = req.params;
  const { force_update } = req.query;
  try {
    await recoveryParamsValidation.validateAsync(force_update);
    const id = await getId.validateAsync(noteId);
    const note = await noteService.deleteOne({
      account_id: req.account.id,
      id,
      force_update,
    });
    return success.handler({ note }, req, res, next);
  } catch (err) {
    return error.handler(err, req, res, next);
  }
};

const copyNote = async (req, res, next) => {
  const { noteId } = req.params;
  try {
    const id = await getId.validateAsync(noteId);
    const note = await noteService.copyNote({
      id,
      account_id: req.account.id,
    });
    return success.handler({ note }, req, res, next);
  } catch (err) {
    return next(err, req, res, next);
  }
};

const suggestCopyName = async (req, res, next) => {
  const { noteId } = req.params;
  try {
    const id = await getId.validateAsync(noteId);
    const account_id = req.account.id;
    const note = await noteService.getOne({ account_id, id });

    const newName = await noteService.suggestCopyName({
      id,
      account_id,
      name: note.name,
    });
    return success.handler({ name: newName }, req, res, next);
  } catch (err) {
    return next(err, req, res, next);
  }
};

module.exports = {
  getListCount,
  getList,
  getOne,
  addOne,
  updateOne,
  updateNotes,
  deleteOne,
  getConfig,
  copyNote,
  suggestCopyName,
};
