// Firestoreに直接データを投入するスクリプト（Firebase Admin SDK使用）
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../.env') });

// Firebase Admin SDKの初期化
// サービスアカウントキーがある場合はそれを使用、なければ環境変数から設定を読み込む
let serviceAccount;
try {
  // サービスアカウントキーのパスを環境変数から取得
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountPath) {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.log('サービスアカウントキーが見つかりません。環境変数から設定を読み込みます。');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // 環境変数から設定を読み込む
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('VITE_FIREBASE_PROJECT_ID環境変数が設定されていません。');
    }
    
    // デフォルトの認証情報を使用（gcloud CLIで認証済みの場合）
    admin.initializeApp({
      projectId: projectId
    });
  }
}

const db = admin.firestore();

// 初期データ
const initialSupportSystemsData = [
  {
    id: 1,
    title: '出産育児一時金',
    description: '出産時に受け取れる一時金です。健康保険から支給されます。',
    amount: '50万円',
    eligibility: '健康保険の被保険者または被扶養者',
    deadline: '出産後2年以内',
    referenceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/shussan/index.html',
    category: 'national',
    // 国の制度関連の情報
    ministryName: '厚生労働省', // 省庁名・組織名
    tags: ['出産', '一時金', '健康保険', '国'],
    searchKeywords: ['出産育児一時金', '一時金', '出産', '健康保険', '50万円', '厚生労働省'],
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: '育児休業給付金',
    description: '育児休業中に受け取れる給付金です。雇用保険から支給されます。',
    amount: '休業開始時賃金の67%（6ヶ月後は50%）',
    eligibility: '雇用保険の被保険者で、育児休業を取得している方',
    deadline: '育児休業開始から休業終了まで',
    referenceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/index.html',
    category: 'national',
    // 国の制度関連の情報
    ministryName: '厚生労働省', // 省庁名・組織名
    tags: ['育児休業', '給付金', '雇用保険', '国'],
    searchKeywords: ['育児休業給付金', '育休', '給付金', '雇用保険', '育児休業', '厚生労働省'],
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: '出産手当金',
    description: '出産前後の休業中に受け取れる手当です。健康保険から支給されます。',
    amount: '標準報酬日額の2/3',
    eligibility: '健康保険の被保険者で、出産のため会社を休んでいる方',
    deadline: '出産予定日を含む42日前から出産後56日目まで',
    referenceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/shussan/index.html',
    category: 'national',
    // 国の制度関連の情報
    ministryName: '厚生労働省', // 省庁名・組織名
    tags: ['出産手当金', '手当', '健康保険', '国'],
    searchKeywords: ['出産手当金', '手当', '出産', '健康保険', '休業', '厚生労働省'],
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: '児童手当',
    description: '0歳から中学校卒業までの児童を養育している方に支給されます。',
    amount: '0〜3歳未満：15,000円、3歳〜小学校修了前：10,000円（第3子以降は15,000円）',
    eligibility: '日本国内に住所を有する児童を養育している方',
    deadline: '毎年6月、10月、2月に支給',
    referenceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/jidouteate/index.html',
    category: 'national',
    // 国の制度関連の情報
    ministryName: '厚生労働省', // 省庁名・組織名
    tags: ['児童手当', '手当', '国'],
    searchKeywords: ['児童手当', '手当', '児童', '子育て', '支給', '厚生労働省'],
    isActive: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    title: '東京都出産応援給付金',
    description: '東京都が実施する出産を応援する給付金制度です。',
    amount: '15万円',
    eligibility: '東京都内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/tokyo-birth-support',
    category: 'prefecture',
    // 都道府県関連の情報
    prefectureName: '東京都', // 都道府県名
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '東京都'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '15万円', '東京都'],
    isActive: true,
    displayOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: '出産祝い金',
    description: '市区町村から出産を祝って支給される祝い金です。',
    amount: '10万円',
    eligibility: '当該市区町村に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/municipality-birth-gift',
    category: 'municipality',
    // 市区町村関連の情報
    municipalityName: '横浜市', // 市・区・町・村の名前
    municipalityType: '市', // '市', '区', '町', '村' のいずれか
    prefecture: '神奈川県', // 都道府県名（オプション）
    tags: ['出産祝い金', '祝い金', '市区町村', '出産'],
    searchKeywords: ['出産祝い金', '祝い金', '市区町村', '出産', '10万円', '横浜市'],
    isActive: true,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: 'ベビー用品購入支援クーポン',
    description: '民間企業が提供するベビー用品購入支援クーポンです。',
    amount: '5万円分のクーポン',
    eligibility: '当該サービスの会員で、出産予定または出産後1年以内の方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/baby-coupon',
    category: 'private',
    // 民間団体関連の情報
    organizationName: 'ベビー用品支援協会', // 団体名
    organizationType: '一般社団法人', // 団体の種類（'企業', 'NPO法人', '一般社団法人', '財団法人', 'その他'など）
    tags: ['ベビー用品', 'クーポン', '民間', '購入支援'],
    searchKeywords: ['ベビー用品', 'クーポン', '民間', '購入支援', '5万円', 'ベビー用品支援協会'],
    isActive: true,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    title: '出産祝い金（企業）',
    description: '勤務先企業から出産を祝って支給される祝い金です。',
    amount: '20万円',
    eligibility: '当該企業に勤務している従業員で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/company-birth-gift',
    category: 'company',
    // 企業関連の情報
    companyName: '株式会社サンプル', // 企業名
    tags: ['出産祝い金', '祝い金', '勤務先', '企業', '出産'],
    searchKeywords: ['出産祝い金', '祝い金', '勤務先', '企業', '出産', '20万円', '株式会社サンプル'],
    isActive: true,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 追加ダミーデータ（ID 9-38、30件）
  // 注意: ID 9は削除（ID 4の「児童手当」と重複していたため）
  // ID 10から開始
  {
    id: 10,
    title: '特別児童扶養手当',
    description: '20歳未満で、精神又は身体に障害を有する児童を監護している父母等に支給される手当です。',
    amount: '1級: 52,400円/月、2級: 34,900円/月',
    eligibility: '20歳未満で、精神又は身体に障害を有する児童を監護している父母等',
    deadline: '毎年8月に申請',
    referenceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/shogaisha/index.html',
    category: 'national',
    ministryName: '厚生労働省',
    tags: ['特別児童扶養手当', '手当', '障害', '国'],
    searchKeywords: ['特別児童扶養手当', '手当', '障害', '厚生労働省'],
    isActive: true,
    displayOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 11,
    title: '大阪府子育て支援給付金',
    description: '大阪府が実施する子育て支援のための給付金制度です。',
    amount: '10万円',
    eligibility: '大阪府内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/osaka-support',
    category: 'prefecture',
    prefectureName: '大阪府',
    tags: ['子育て支援', '給付金', '都道府県', '出産', '大阪府'],
    searchKeywords: ['子育て支援', '給付金', '都道府県', '出産', '10万円', '大阪府'],
    isActive: true,
    displayOrder: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 12,
    title: '神奈川県出産応援給付金',
    description: '神奈川県が実施する出産を応援する給付金制度です。',
    amount: '12万円',
    eligibility: '神奈川県内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/kanagawa-support',
    category: 'prefecture',
    prefectureName: '神奈川県',
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '神奈川県'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '12万円', '神奈川県'],
    isActive: true,
    displayOrder: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 13,
    title: '愛知県子育て応援給付金',
    description: '愛知県が実施する子育てを応援する給付金制度です。',
    amount: '8万円',
    eligibility: '愛知県内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/aichi-support',
    category: 'prefecture',
    prefectureName: '愛知県',
    tags: ['子育て応援給付金', '給付金', '都道府県', '出産', '愛知県'],
    searchKeywords: ['子育て応援給付金', '給付金', '都道府県', '出産', '8万円', '愛知県'],
    isActive: true,
    displayOrder: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 14,
    title: '福岡県出産支援給付金',
    description: '福岡県が実施する出産を支援する給付金制度です。',
    amount: '10万円',
    eligibility: '福岡県内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/fukuoka-support',
    category: 'prefecture',
    prefectureName: '福岡県',
    tags: ['出産支援給付金', '給付金', '都道府県', '出産', '福岡県'],
    searchKeywords: ['出産支援給付金', '給付金', '都道府県', '出産', '10万円', '福岡県'],
    isActive: true,
    displayOrder: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 15,
    title: '千葉県出産応援給付金',
    description: '千葉県が実施する出産を応援する給付金制度です。',
    amount: '7万円',
    eligibility: '千葉県内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/chiba-support',
    category: 'prefecture',
    prefectureName: '千葉県',
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '千葉県'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '7万円', '千葉県'],
    isActive: true,
    displayOrder: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 16,
    title: '大阪市出産祝い金',
    description: '大阪市から出産を祝って支給される祝い金です。',
    amount: '5万円',
    eligibility: '大阪市内に住民票がある方で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/osaka-city-gift',
    category: 'municipality',
    municipalityName: '大阪市',
    municipalityType: '市',
    prefecture: '大阪府',
    tags: ['出産祝い金', '祝い金', '市区町村', '出産', '大阪市'],
    searchKeywords: ['出産祝い金', '祝い金', '市区町村', '出産', '5万円', '大阪市'],
    isActive: true,
    displayOrder: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 17,
    title: '名古屋市子育て支援給付金',
    description: '名古屋市が実施する子育て支援のための給付金制度です。',
    amount: '6万円',
    eligibility: '名古屋市内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/nagoya-support',
    category: 'municipality',
    municipalityName: '名古屋市',
    municipalityType: '市',
    prefecture: '愛知県',
    tags: ['子育て支援', '給付金', '市区町村', '出産', '名古屋市'],
    searchKeywords: ['子育て支援', '給付金', '市区町村', '出産', '6万円', '名古屋市'],
    isActive: true,
    displayOrder: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 18,
    title: '福岡市出産応援給付金',
    description: '福岡市が実施する出産を応援する給付金制度です。',
    amount: '5万円',
    eligibility: '福岡市内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/fukuoka-city-support',
    category: 'municipality',
    municipalityName: '福岡市',
    municipalityType: '市',
    prefecture: '福岡県',
    tags: ['出産応援給付金', '給付金', '市区町村', '出産', '福岡市'],
    searchKeywords: ['出産応援給付金', '給付金', '市区町村', '出産', '5万円', '福岡市'],
    isActive: true,
    displayOrder: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 19,
    title: '札幌市出産祝い金',
    description: '札幌市から出産を祝って支給される祝い金です。',
    amount: '4万円',
    eligibility: '札幌市内に住民票がある方で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/sapporo-gift',
    category: 'municipality',
    municipalityName: '札幌市',
    municipalityType: '市',
    prefecture: '北海道',
    tags: ['出産祝い金', '祝い金', '市区町村', '出産', '札幌市'],
    searchKeywords: ['出産祝い金', '祝い金', '市区町村', '出産', '4万円', '札幌市'],
    isActive: true,
    displayOrder: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 20,
    title: '仙台市子育て支援給付金',
    description: '仙台市が実施する子育て支援のための給付金制度です。',
    amount: '5万円',
    eligibility: '仙台市内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/sendai-support',
    category: 'municipality',
    municipalityName: '仙台市',
    municipalityType: '市',
    prefecture: '宮城県',
    tags: ['子育て支援', '給付金', '市区町村', '出産', '仙台市'],
    searchKeywords: ['子育て支援', '給付金', '市区町村', '出産', '5万円', '仙台市'],
    isActive: true,
    displayOrder: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 21,
    title: '川崎市出産応援給付金',
    description: '川崎市が実施する出産を応援する給付金制度です。',
    amount: '6万円',
    eligibility: '川崎市内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/kawasaki-support',
    category: 'municipality',
    municipalityName: '川崎市',
    municipalityType: '市',
    prefecture: '神奈川県',
    tags: ['出産応援給付金', '給付金', '市区町村', '出産', '川崎市'],
    searchKeywords: ['出産応援給付金', '給付金', '市区町村', '出産', '6万円', '川崎市'],
    isActive: true,
    displayOrder: 21,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 22,
    title: 'さいたま市出産祝い金',
    description: 'さいたま市から出産を祝って支給される祝い金です。',
    amount: '5万円',
    eligibility: 'さいたま市内に住民票がある方で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/saitama-gift',
    category: 'municipality',
    municipalityName: 'さいたま市',
    municipalityType: '市',
    prefecture: '埼玉県',
    tags: ['出産祝い金', '祝い金', '市区町村', '出産', 'さいたま市'],
    searchKeywords: ['出産祝い金', '祝い金', '市区町村', '出産', '5万円', 'さいたま市'],
    isActive: true,
    displayOrder: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 23,
    title: '一般社団法人ベビー用品支援協会 ベビー用品支援',
    description: '一般社団法人ベビー用品支援協会が実施するベビー用品の支援制度です。',
    amount: 'ベビー用品セット（約3万円相当）',
    eligibility: '出産予定または出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/baby-goods-support',
    category: 'private',
    organizationName: '一般社団法人ベビー用品支援協会',
    organizationType: '一般社団法人',
    tags: ['ベビー用品', '支援', '民間', '出産'],
    searchKeywords: ['ベビー用品', '支援', '民間', '出産', '一般社団法人ベビー用品支援協会'],
    isActive: true,
    displayOrder: 23,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 24,
    title: 'NPO法人子育て支援ネットワーク 子育て支援給付',
    description: 'NPO法人子育て支援ネットワークが実施する子育て支援のための給付制度です。',
    amount: '3万円',
    eligibility: '子育て中の方',
    deadline: '随時',
    referenceUrl: 'https://example.com/npo-support',
    category: 'private',
    organizationName: 'NPO法人子育て支援ネットワーク',
    organizationType: 'NPO法人',
    tags: ['子育て支援', '給付', '民間', 'NPO'],
    searchKeywords: ['子育て支援', '給付', '民間', 'NPO法人子育て支援ネットワーク'],
    isActive: true,
    displayOrder: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 25,
    title: '社会福祉法人マザーズサポート 出産支援給付',
    description: '社会福祉法人マザーズサポートが実施する出産支援のための給付制度です。',
    amount: '5万円',
    eligibility: '出産予定または出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/mothers-support',
    category: 'private',
    organizationName: '社会福祉法人マザーズサポート',
    organizationType: '社会福祉法人',
    tags: ['出産支援', '給付', '民間', '社会福祉'],
    searchKeywords: ['出産支援', '給付', '民間', '社会福祉法人マザーズサポート'],
    isActive: true,
    displayOrder: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 26,
    title: '公益財団法人子育て応援基金 子育て応援給付',
    description: '公益財団法人子育て応援基金が実施する子育て応援のための給付制度です。',
    amount: '4万円',
    eligibility: '子育て中の方',
    deadline: '随時',
    referenceUrl: 'https://example.com/kosodate-fund',
    category: 'private',
    organizationName: '公益財団法人子育て応援基金',
    organizationType: '公益財団法人',
    tags: ['子育て応援', '給付', '民間', '公益財団'],
    searchKeywords: ['子育て応援', '給付', '民間', '公益財団法人子育て応援基金'],
    isActive: true,
    displayOrder: 26,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 27,
    title: '株式会社テクノロジー 出産祝い金',
    description: '株式会社テクノロジーから出産を祝って支給される祝い金です。',
    amount: '15万円',
    eligibility: '当該企業に勤務している従業員で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/tech-company-gift',
    category: 'company',
    companyName: '株式会社テクノロジー',
    tags: ['出産祝い金', '祝い金', '勤務先', '企業', '出産'],
    searchKeywords: ['出産祝い金', '祝い金', '勤務先', '企業', '出産', '15万円', '株式会社テクノロジー'],
    isActive: true,
    displayOrder: 27,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 28,
    title: '株式会社グローバル 子育て支援給付',
    description: '株式会社グローバルが実施する子育て支援のための給付制度です。',
    amount: '10万円',
    eligibility: '当該企業に勤務している従業員で、子育て中の方',
    deadline: '随時',
    referenceUrl: 'https://example.com/global-support',
    category: 'company',
    companyName: '株式会社グローバル',
    tags: ['子育て支援', '給付', '勤務先', '企業'],
    searchKeywords: ['子育て支援', '給付', '勤務先', '企業', '10万円', '株式会社グローバル'],
    isActive: true,
    displayOrder: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 29,
    title: '株式会社イノベーション 出産応援給付',
    description: '株式会社イノベーションが実施する出産を応援する給付制度です。',
    amount: '12万円',
    eligibility: '当該企業に勤務している従業員で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/innovation-support',
    category: 'company',
    companyName: '株式会社イノベーション',
    tags: ['出産応援', '給付', '勤務先', '企業', '出産'],
    searchKeywords: ['出産応援', '給付', '勤務先', '企業', '出産', '12万円', '株式会社イノベーション'],
    isActive: true,
    displayOrder: 29,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 30,
    title: '株式会社ライフスタイル 出産祝い金',
    description: '株式会社ライフスタイルから出産を祝って支給される祝い金です。',
    amount: '8万円',
    eligibility: '当該企業に勤務している従業員で、出産した方',
    deadline: '出産後3ヶ月以内',
    referenceUrl: 'https://example.com/lifestyle-gift',
    category: 'company',
    companyName: '株式会社ライフスタイル',
    tags: ['出産祝い金', '祝い金', '勤務先', '企業', '出産'],
    searchKeywords: ['出産祝い金', '祝い金', '勤務先', '企業', '出産', '8万円', '株式会社ライフスタイル'],
    isActive: true,
    displayOrder: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 31,
    title: '株式会社ファイナンス 子育て支援給付',
    description: '株式会社ファイナンスが実施する子育て支援のための給付制度です。',
    amount: '10万円',
    eligibility: '当該企業に勤務している従業員で、子育て中の方',
    deadline: '随時',
    referenceUrl: 'https://example.com/finance-support',
    category: 'company',
    companyName: '株式会社ファイナンス',
    tags: ['子育て支援', '給付', '勤務先', '企業'],
    searchKeywords: ['子育て支援', '給付', '勤務先', '企業', '10万円', '株式会社ファイナンス'],
    isActive: true,
    displayOrder: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 32,
    title: '株式会社ヘルスケア 出産応援給付',
    description: '株式会社ヘルスケアが実施する出産を応援する給付制度です。',
    amount: '15万円',
    eligibility: '当該企業に勤務している従業員で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/healthcare-support',
    category: 'company',
    companyName: '株式会社ヘルスケア',
    tags: ['出産応援', '給付', '勤務先', '企業', '出産'],
    searchKeywords: ['出産応援', '給付', '勤務先', '企業', '出産', '15万円', '株式会社ヘルスケア'],
    isActive: true,
    displayOrder: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 33,
    title: '埼玉県出産応援給付金',
    description: '埼玉県が実施する出産を応援する給付金制度です。',
    amount: '9万円',
    eligibility: '埼玉県内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/saitama-pref-support',
    category: 'prefecture',
    prefectureName: '埼玉県',
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '埼玉県'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '9万円', '埼玉県'],
    isActive: true,
    displayOrder: 33,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 34,
    title: '兵庫県子育て支援給付金',
    description: '兵庫県が実施する子育て支援のための給付金制度です。',
    amount: '8万円',
    eligibility: '兵庫県内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/hyogo-support',
    category: 'prefecture',
    prefectureName: '兵庫県',
    tags: ['子育て支援', '給付金', '都道府県', '出産', '兵庫県'],
    searchKeywords: ['子育て支援', '給付金', '都道府県', '出産', '8万円', '兵庫県'],
    isActive: true,
    displayOrder: 34,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 35,
    title: '静岡県出産応援給付金',
    description: '静岡県が実施する出産を応援する給付金制度です。',
    amount: '7万円',
    eligibility: '静岡県内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/shizuoka-support',
    category: 'prefecture',
    prefectureName: '静岡県',
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '静岡県'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '7万円', '静岡県'],
    isActive: true,
    displayOrder: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 36,
    title: '広島県子育て支援給付金',
    description: '広島県が実施する子育て支援のための給付金制度です。',
    amount: '6万円',
    eligibility: '広島県内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/hiroshima-support',
    category: 'prefecture',
    prefectureName: '広島県',
    tags: ['子育て支援', '給付金', '都道府県', '出産', '広島県'],
    searchKeywords: ['子育て支援', '給付金', '都道府県', '出産', '6万円', '広島県'],
    isActive: true,
    displayOrder: 36,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 37,
    title: '京都府出産応援給付金',
    description: '京都府が実施する出産を応援する給付金制度です。',
    amount: '8万円',
    eligibility: '京都府内に住民票がある方で、出産した方',
    deadline: '出産後1年以内',
    referenceUrl: 'https://example.com/kyoto-support',
    category: 'prefecture',
    prefectureName: '京都府',
    tags: ['出産応援給付金', '給付金', '都道府県', '出産', '京都府'],
    searchKeywords: ['出産応援給付金', '給付金', '都道府県', '出産', '8万円', '京都府'],
    isActive: true,
    displayOrder: 37,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 38,
    title: '新潟県子育て支援給付金',
    description: '新潟県が実施する子育て支援のための給付金制度です。',
    amount: '7万円',
    eligibility: '新潟県内に住民票がある方で、出産した方',
    deadline: '出産後6ヶ月以内',
    referenceUrl: 'https://example.com/niigata-support',
    category: 'prefecture',
    prefectureName: '新潟県',
    tags: ['子育て支援', '給付金', '都道府県', '出産', '新潟県'],
    searchKeywords: ['子育て支援', '給付金', '都道府県', '出産', '7万円', '新潟県'],
    isActive: true,
    displayOrder: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedData() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Firestoreにデータを投入開始...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const supportSystemsRef = db.collection('supportSystems');
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log(`📝 ${initialSupportSystemsData.length}件の制度データを投入します...`);
    
    for (const system of initialSupportSystemsData) {
      try {
        const systemRef = supportSystemsRef.doc(String(system.id));
        
        // 既に存在する場合はスキップ
        const snapshot = await systemRef.get();
        if (snapshot.exists) {
          console.log(`⏭️  制度「${system.title}」(ID: ${system.id})は既に存在します。スキップします。`);
          skippedCount++;
          continue;
        }
        
        // データを保存
        await systemRef.set(system);
        console.log(`✅ 制度「${system.title}」(ID: ${system.id}, カテゴリ: ${system.category})を追加しました。`);
        addedCount++;
      } catch (error) {
        console.error(`❌ 制度「${system.title}」(ID: ${system.id})の追加に失敗しました:`, error.message);
        errorCount++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 データ投入結果:`);
    console.log(`   ✅ 追加: ${addedCount}件`);
    console.log(`   ⏭️  スキップ: ${skippedCount}件`);
    console.log(`   ❌ エラー: ${errorCount}件`);
    console.log(`   📝 合計: ${initialSupportSystemsData.length}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ データ投入が完了しました！');
    
    process.exit(0);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ エラーが発生しました:', error.message);
    console.error('エラー詳細:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

seedData();

