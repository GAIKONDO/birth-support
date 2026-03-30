import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import MyPage from './components/MyPage';
import SupportSystems from './components/SupportSystems';
import PaymentAmount from './components/PaymentAmount';
import NecessaryExpenses from './components/NecessaryExpenses';
import TaxBenefits from './components/TaxBenefits';
import Statistics from './components/Statistics';
import ActionManagement from './components/ActionManagement';
import LumpSumDetail from './components/LumpSumDetail';
import ChildcareLeaveDetail from './components/ChildcareLeaveDetail';
import ChildbirthAllowanceDetail from './components/ChildbirthAllowanceDetail';
import ChildAllowanceDetail from './components/ChildAllowanceDetail';
import PaternityLeaveDetail from './components/PaternityLeaveDetail';
import PostBirthLeaveSupportDetail from './components/PostBirthLeaveSupportDetail';
import ChildcareShortTimeWorkDetail from './components/ChildcareShortTimeWorkDetail';
import PregnancySupportDetail from './components/PregnancySupportDetail';
import ElectronicMaternalHandbook from './components/ElectronicMaternalHandbook';
import ExaminationDetail from './components/ExaminationDetail';
import Search from './components/Search';
import AIAssistant from './components/AIAssistant';
import InvitePage from './components/InvitePage';
import Specification from './components/Specification';
import SpecificationOverview from './components/SpecificationOverview';
import SpecificationFeatures from './components/SpecificationFeatures';
import SpecificationTechStack from './components/SpecificationTechStack';
import SpecificationSystemArchitecture from './components/SpecificationSystemArchitecture';
import SpecificationInfrastructure from './components/SpecificationInfrastructure';
import SpecificationDataStructure from './components/SpecificationDataStructure';
import SpecificationPageStructure from './components/SpecificationPageStructure';
import SpecificationBusinessPlan from './components/SpecificationBusinessPlan';
import SpecificationBusinessPlanDetail from './components/SpecificationBusinessPlanDetail';
import SpecificationBusinessPlanSimulation from './components/SpecificationBusinessPlanSimulation';
import SpecificationRiskAssessment from './components/SpecificationRiskAssessment';
import SpecificationSnapshotComparison from './components/SpecificationSnapshotComparison';
import SpecificationRingisho from './components/SpecificationRingisho';
import SpecificationMarketSize from './components/SpecificationMarketSize';
import SpecificationSubsidies from './components/SpecificationSubsidies';
import SpecificationUserSubsidies from './components/SpecificationUserSubsidies';
import SpecificationCaseStudy from './components/SpecificationCaseStudy';
import SpecificationCaseStudyGovernmentReporting from './components/SpecificationCaseStudyGovernmentReporting';
import SpecificationCaseStudyMaleChildcareLeave from './components/SpecificationCaseStudyMaleChildcareLeave';
import SpecificationCaseStudyWorkLifeBalance from './components/SpecificationCaseStudyWorkLifeBalance';
import SpecificationCaseStudyPolicyEffectiveness from './components/SpecificationCaseStudyPolicyEffectiveness';
import SpecificationCaseStudyHealthManagement from './components/SpecificationCaseStudyHealthManagement';
import SpecificationCaseStudyTurnoverReduction from './components/SpecificationCaseStudyTurnoverReduction';
import SpecificationCaseStudyEmployeeSatisfaction from './components/SpecificationCaseStudyEmployeeSatisfaction';
import SpecificationCaseStudySocialEvaluation from './components/SpecificationCaseStudySocialEvaluation';
import SpecificationCaseStudyEmployeeWorkLifeBalance from './components/SpecificationCaseStudyEmployeeWorkLifeBalance';
import SpecificationCaseStudyEmployeeFinancialRelief from './components/SpecificationCaseStudyEmployeeFinancialRelief';
import SpecificationCaseStudyEmployeeChildcareSupport from './components/SpecificationCaseStudyEmployeeChildcareSupport';
import SpecificationCaseStudyPregnancyInformation from './components/SpecificationCaseStudyPregnancyInformation';
import SpecificationCaseStudyPregnancyDeadline from './components/SpecificationCaseStudyPregnancyDeadline';
import SpecificationCaseStudyPregnancyFinancial from './components/SpecificationCaseStudyPregnancyFinancial';
import SpecificationCaseStudyPregnancyMedicalRecord from './components/SpecificationCaseStudyPregnancyMedicalRecord';
import SpecificationCaseStudyPostpartumChildcareAnxiety from './components/SpecificationCaseStudyPostpartumChildcareAnxiety';
import SpecificationCaseStudyPostpartumLeaveApplication from './components/SpecificationCaseStudyPostpartumLeaveApplication';
import SpecificationCaseStudyPostpartumFamilySharing from './components/SpecificationCaseStudyPostpartumFamilySharing';
import SpecificationCaseStudyPostpartumMedicalCost from './components/SpecificationCaseStudyPostpartumMedicalCost';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import ServiceOverview from './components/ServiceOverview';
import CompanyOverview from './components/CompanyOverview';
import Pricing from './components/Pricing';
import Registration from './components/Registration';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service-overview" element={<ServiceOverview />} />
          <Route path="/company-overview" element={<CompanyOverview />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/mypage" element={<Login />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route
            path="/mypage-authenticated"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems"
            element={
              <ProtectedRoute>
                <Layout>
                  <SupportSystems />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-amount"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentAmount />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/necessary-expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <NecessaryExpenses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax-benefits"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaxBenefits />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Statistics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-management"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActionManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/lump-sum"
            element={
              <ProtectedRoute>
                <Layout>
                  <LumpSumDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/childcare-leave"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChildcareLeaveDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/childbirth-allowance"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChildbirthAllowanceDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/child-allowance"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChildAllowanceDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/paternity-leave"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaternityLeaveDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-systems/post-birth-leave-support"
            element={
              <ProtectedRoute>
                <Layout>
                  <PostBirthLeaveSupportDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
                  <Route
                    path="/support-systems/childcare-short-time-work"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ChildcareShortTimeWorkDetail />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/support-systems/pregnancy-support"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <PregnancySupportDetail />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
          <Route
            path="/electronic-maternal-handbook"
            element={
              <ProtectedRoute>
                <Layout>
                  <ElectronicMaternalHandbook />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/electronic-maternal-handbook/examination/:examinationId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExaminationDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification"
            element={
              <ProtectedRoute>
                <Navigate to="/specification/overview" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/overview"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationOverview />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/features"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationFeatures />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/tech-stack"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationTechStack />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/system-architecture"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationSystemArchitecture />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/infrastructure"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationInfrastructure />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/data-structure"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationDataStructure />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/page-structure"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationPageStructure />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/business-plan"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationBusinessPlan />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/business-plan-detail"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationBusinessPlanDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/business-plan-simulation"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationBusinessPlanSimulation />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/risk-assessment"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationRiskAssessment />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/market-size"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationMarketSize />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/subsidies"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationSubsidies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/user-subsidies"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationUserSubsidies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudy />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/government-reporting"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyGovernmentReporting />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/male-childcare-leave"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyMaleChildcareLeave />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/work-life-balance"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyWorkLifeBalance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/policy-effectiveness"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPolicyEffectiveness />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/health-management"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyHealthManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/turnover-reduction"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyTurnoverReduction />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/employee-satisfaction"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyEmployeeSatisfaction />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/social-evaluation"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudySocialEvaluation />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/employee-work-life-balance"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyEmployeeWorkLifeBalance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/employee-financial-relief"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyEmployeeFinancialRelief />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/employee-childcare-support"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyEmployeeChildcareSupport />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/pregnancy-information"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPregnancyInformation />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/pregnancy-deadline"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPregnancyDeadline />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/pregnancy-financial"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPregnancyFinancial />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/pregnancy-medical-record"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPregnancyMedicalRecord />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/postpartum-childcare-anxiety"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPostpartumChildcareAnxiety />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/postpartum-leave-application"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPostpartumLeaveApplication />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/postpartum-family-sharing"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPostpartumFamilySharing />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/case-study/postpartum-medical-cost"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationCaseStudyPostpartumMedicalCost />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/snapshot-comparison"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationSnapshotComparison />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/specification/ringisho"
            element={
              <ProtectedRoute>
                <Layout>
                  <SpecificationRingisho />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <Search />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAssistant />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/mypage" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
