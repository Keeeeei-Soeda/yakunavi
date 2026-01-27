import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticate, authorizeUserType } from '../middleware/auth';

const router = Router();
const contractController = new ContractController();

// 正式オファーを送信（契約を作成） - 薬局のみ
router.post(
    '/',
    authenticate,
    authorizeUserType('pharmacy'),
    (req, res) => contractController.createContract(req, res)
);

// オファーを承認 - 薬剤師のみ
router.post(
    '/:id/approve',
    authenticate,
    authorizeUserType('pharmacist'),
    (req, res) => contractController.approveContract(req, res)
);

// オファーを辞退 - 薬剤師のみ
router.post(
    '/:id/reject',
    authenticate,
    authorizeUserType('pharmacist'),
    (req, res) => contractController.rejectContract(req, res)
);

// 契約一覧を取得（薬局側）
router.get(
    '/pharmacy/:pharmacyId',
    authenticate,
    authorizeUserType('pharmacy'),
    (req, res) => contractController.getContractsByPharmacy(req, res)
);

// 契約一覧を取得（薬剤師側）
router.get(
    '/pharmacist/:pharmacistId',
    authenticate,
    authorizeUserType('pharmacist'),
    (req, res) => contractController.getContractsByPharmacist(req, res)
);

// 応募IDから契約を取得
router.get(
    '/application/:applicationId',
    authenticate,
    (req, res) => contractController.getContractByApplicationId(req, res)
);

// 契約詳細を取得
router.get('/:id', authenticate, (req, res) =>
    contractController.getContractById(req, res)
);

export default router;

