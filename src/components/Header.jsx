
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { LogOut, Menu, User, ArrowLeft } from 'lucide-react';
import { logoutSuccessful } from '@/redux/actions/user-actions';
import { USER_SOURCE } from '@/constants/user';
import { sourceKey } from '@/locales/config';
import { useTranslation } from '@/locales/useTranslation';
import { getIShareRedirectUrl } from '@/utility/common-functions';

const Header = (props) => {
  const { user, isCollapsed, onToggleNav, onLogout } = props;
  const profileImage = user?.user?.businessInfo?.profilePictureUrl;
  const isEnterpriseFromIShare = user?.user?.source === USER_SOURCE.ISHARE_ENTERPRISE;
  const { t } = useTranslation();
  const handleLogout = () => {
    // If user is from IShare Enterprise, redirect back to IShare instead of logging out
    if (isEnterpriseFromIShare) {
      props.logoutSuccessful();
      window.location.href = getIShareRedirectUrl();
      return;
    }

    if (onLogout) {
      onLogout();
      return;
    }
    props.logoutSuccessful();
    props.router.push('/login');
  };


  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCollapsed && onToggleNav && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNav}
              aria-label="Open navigation"
              className="h-10 w-10 text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          {!isCollapsed && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.user?.businessInfo?.businessName}</h2>
              <p className="text-gray-600">Manage your social media campaigns</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button> */}

          <DropdownMenu>
            <div className="flex items-center space-x-3 cursor-pointer">
              <Avatar>
                <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  {!profileImage ? <User className="h-4 w-4 text-white" /> : <img src={profileImage} className="h-full w-full object-cover rounded-full" />}
                </div>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.user?.businessInfo?.businessName}</p>
                {user?.user?.businessInfo?.businessEmail && <p className="text-gray-500">{user?.user?.businessInfo?.businessEmail}</p>}
              </div>
            </div>
          </DropdownMenu>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              {isEnterpriseFromIShare ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("nTback", sourceKey.user)}
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nTlogout", sourceKey.user)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  logoutSuccessful,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
