import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import CalendarRoutes from './modules/calendar/routes';
import CompaniesRoutes from './modules/companies/routes';
import CustomersRoutes from './modules/customers/routes';
import DashboardRoutes from './modules/dashboard/routes';
import DealsRoutes from './modules/deals/routes';
import EngageRoutes from './modules/engage/routes';
import GrowthHackRoutes from './modules/growthHacks/routes';
import InboxRoutes from './modules/inbox/routes';
import InsightsRoutes from './modules/insights/routes';
import KnowledgeBaseRoutes from './modules/knowledgeBase/routes';
import LeadRoutes from './modules/leads/routes';
import NotificationRoutes from './modules/notifications/routes';
import SegmentsRoutes from './modules/segments/routes';
import SettingsRoutes from './modules/settings/routes';
import TagsRoutes from './modules/tags/routes';
import TaskRoutes from './modules/tasks/routes';
import TicketRoutes from './modules/tickets/routes';
import TutorialRoutes from './modules/tutorial/routes';
import VideoCallRoutes from './modules/videoCall/routes';

const MainLayout = asyncComponent(() =>
  import(
    /* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout'
  )
);

const Unsubscribe = asyncComponent(() =>
  import(
    /* webpackChunkName: "Unsubscribe" */ 'modules/auth/containers/Unsubscribe'
  )
);

const UserConfirmation = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - UserConfirmation" */ 'modules/settings/team/containers/UserConfirmation'
  )
);

export const unsubscribe = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const tryRequire = (requirPath) => {
  try {
    return require(`${requirPath}`);
  } catch (err) {
    return {};
  }
};

const renderRoutes = currentUser => {
  const userConfirmation = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    return (
      <UserConfirmation queryParams={queryParams} currentUser={currentUser} />
    );
  };

  if (!sessionStorage.getItem('sessioncode')) {
    sessionStorage.setItem('sessioncode', Math.random().toString());
  }

  if (currentUser) {
    const pluginModules = tryRequire('./plugins').default || {};

    const plugins: any = [];
    const pluginRoutes: any = [];
    const specialPluginRoutes: any = [];

    for (const pluginName of Object.keys(pluginModules)) {
      const plugin = pluginModules[pluginName]();

      plugins.push({
        name: pluginName,
        ...plugin
      });

      if (plugin.response) {
        const Component = plugin.response;
        specialPluginRoutes.push(
          <Component currentUser={currentUser} />
        )
      }

      if (plugin.routes) {
        for (const route of plugin.routes) {
          const { component } = route;
          const path = `/${pluginName}${route.path}`

          pluginRoutes.push(
            <Route
              key={path}
              exact={true}
              path={path}
              component={component}
            />
          )
        }
      }
    }

    return (
      <>
        <MainLayout currentUser={currentUser} plugins={plugins}>
          <NotificationRoutes />
          <InboxRoutes />
          <SegmentsRoutes />
          <CustomersRoutes />
          <CompaniesRoutes />
          <InsightsRoutes />
          <EngageRoutes />
          <KnowledgeBaseRoutes />
          <LeadRoutes />
          <SettingsRoutes />
          <TagsRoutes />
          <DealsRoutes />
          <TicketRoutes />
          <TaskRoutes />
          <GrowthHackRoutes />
          <VideoCallRoutes />
          <TutorialRoutes />
          <CalendarRoutes />
          <DashboardRoutes />

          {specialPluginRoutes}
          {pluginRoutes}

          <Route
            key="/confirmation"
            exact={true}
            path="/confirmation"
            component={userConfirmation}
          />
        </MainLayout>
      </>
    );
  }

  return (
    <Switch>
      <Route
        key="/confirmation"
        exact={true}
        path="/confirmation"
        component={userConfirmation}
      />
      <AuthRoutes />
    </Switch>
  );
};

const Routes = ({ currentUser }: { currentUser: IUser }) => (
  <Router>
    <>
      <Route
        key="/unsubscribe"
        exact={true}
        path="/unsubscribe"
        component={unsubscribe}
      />

      {renderRoutes(currentUser)}
    </>
  </Router>
);

export default withCurrentUser(Routes);
