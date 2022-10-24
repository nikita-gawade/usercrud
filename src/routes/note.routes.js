const express = require('express');
const { noteController } = require('../controllers');

const noteRoutes = express.Router({});

noteRoutes.get('/', noteController.getList);
noteRoutes.post('/', noteController.addOne);
noteRoutes.put('/', noteController.updateNotes); // bulk update(add+update+delete)
noteRoutes.get('/count', noteController.getListCount);
noteRoutes.get('/display-settings/', noteController.getConfig);
noteRoutes.get('/:noteId/', noteController.getOne);
noteRoutes.put('/:noteId/', noteController.updateOne);
noteRoutes.delete('/:noteId/', noteController.deleteOne);
noteRoutes.post('/:noteId/copy', noteController.copyNote);
noteRoutes.get('/:noteId/copy-names', noteController.suggestCopyName);

module.exports = noteRoutes;
