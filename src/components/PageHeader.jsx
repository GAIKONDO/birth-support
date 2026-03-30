import { useOwnerId } from '../hooks/useOwnerId';
import './PageHeader.css';

const PageHeader = ({ title, showSharingButton = true }) => {
  const { isSharedMember, ownerEmail, ownerDisplayName } = useOwnerId();

  return (
    <>
      <div className="page-header-gradient">
        <div className="page-header-content">
          <div className="page-header-top">
          </div>
          {isSharedMember && (
            <div className="page-header-shared-info">
              <span className="page-header-shared-badge">共有中</span>
              <span className="page-header-owner-name">
                {ownerDisplayName || ownerEmail || 'オーナー'}さんのページ
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageHeader;


