const EvidenceService = require('../services/evidence.service');

class EvidenceController {
  static async captureEvidence(req, res, next) {
    try {
      const { expenseId, beneficiaryId, ngoId, imageDataBase64, locationMeta } = req.body;
      const fileHash = '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c';

      const evidence = await EvidenceService.createEvidence({
        expenseId: expenseId || 'EXP-2026-77A2',
        beneficiaryId: beneficiaryId || 'BEN-72A91',
        receiptId: 'DR-2026-8F72K9',
        ngoId: ngoId || 'NGO-1042',
        fileHash,
        capturedViaCamera: true,
        locationMeta,
      });

      return res.status(201).json({
        success: true,
        evidenceId: evidence.id,
        fileHash: evidence.file_hash,
        storagePath: evidence.storage_path,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EvidenceController;
