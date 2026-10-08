import { StatementService } from '../services/statementService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class StatementController {
  static async getStatementSummary(req, res, next) {
    try {
      const summary = await StatementService.calculateStatement(req.user._id, req.query);
      return ApiResponse.success(res, 'Statement summary generated.', summary);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async downloadStatement(req, res, next) {
    try {
      const { pdfDoc, filename } = await StatementService.generatePDFStream(req.user._id, req.query);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
