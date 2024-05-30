import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';

import { Button, FileIcon, Typography, useDesignSystemTheme } from '@databricks/design-system';

import Utils from '../../../common/utils/Utils';
import type { ReduxState } from '../../../redux-types';
import { useLocation } from '../../../common/utils/RoutingUtils';
import { EXPERIMENT_PARENT_ID_TAG } from '../experiment-page/utils/experimentPage.common-utils';

import { RunViewStatusBox } from './overview/RunViewStatusBox';
import { RunViewUserLinkBox } from './overview/RunViewUserLinkBox';
import { RunViewParamsTable } from './overview/RunViewParamsTable';
import { RunViewMetricsTable } from './overview/RunViewMetricsTable';
import { RunViewDatasetBox } from './overview/RunViewDatasetBox';
import { RunViewParentRunBox } from './overview/RunViewParentRunBox';
import { RunViewTagsBox } from './overview/RunViewTagsBox';
import { RunViewDescriptionBox } from './overview/RunViewDescriptionBox';
import { RunViewMetadataRow } from './overview/RunViewMetadataRow';
import { RunViewRegisteredModelsBox } from './overview/RunViewRegisteredModelsBox';
import { RunViewLoggedModelsBox } from './overview/RunViewLoggedModelsBox';
import { RunViewSourceBox } from './overview/RunViewSourceBox';
import { HTTPMethods, fetchEndpoint } from 'common/utils/FetchUtils';
import { RunState } from 'experiment-tracking/types';
import { ChangeStateModal } from './ChangeStateModal/ChangeStateModal';

const EmptyValue = () => <Typography.Hint>—</Typography.Hint>;

export const RunViewOverviewV2 = ({
  runUuid,
  onRunDataUpdated,
}: {
  runUuid: string;
  onRunDataUpdated: () => void | Promise<any>;
}) => {
  const { theme } = useDesignSystemTheme();
  const { search } = useLocation();
  const { tags, runInfo, datasets, params, registeredModels, latestMetrics } = useSelector(
    ({ entities }: ReduxState) => ({
      tags: entities.tagsByRunUuid[runUuid],
      runInfo: entities.runInfosByUuid[runUuid],
      datasets: entities.runDatasetsByUuid[runUuid],
      params: entities.paramsByRunUuid[runUuid],
      latestMetrics: entities.latestMetricsByRunUuid[runUuid],
      registeredModels: entities.modelVersionsByRunUuid[runUuid],
    }),
  );

  const [states, setStates] = useState<RunState[]>([]);

  useEffect(() => {
    fetchEndpoint({
      relativeUrl: `ajax-api/2.0/mlflow/states/search`,
      method: HTTPMethods.POST,
      body: JSON.stringify({
        experiment_id: runInfo.experiment_id,
      }),
      success: async ({ resolve, response }: any) => {
        const json = await response.json();
        const states = json.states as RunState[];
        setStates(states);
        resolve();
      },
    });
  }, [runInfo.experiment_id, setStates]);

  const [state, setState] = useState(runInfo.run_state_id || '');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      fetchEndpoint({
        relativeUrl: `ajax-api/2.0/mlflow/states/get?state_id=${runInfo.run_state_id}`,
        method: HTTPMethods.GET,
        success: async ({ resolve, response }: any) => {
          const json = await response.json();
          const name = json?.state.name;
          setState(name);
          resolve();
        },
      });
    };
    fetchData();
  }, [setState, runInfo.run_state_id]);

  const loggedModels = useMemo(() => Utils.getLoggedModelsFromTags(tags), [tags]);
  const parentRunIdTag = tags[EXPERIMENT_PARENT_ID_TAG];

  return (
    <div css={{ flex: '1' }}>
      <ChangeStateModal
        isOpen={isModalOpen}
        states={states}
        currState={{ state_id: runInfo.run_state_id, name: state, experiment_id: runInfo.experiment_id }}
        runId={runInfo.run_uuid}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={async (stateId: string) => {
          fetchEndpoint({
            relativeUrl: `ajax-api/2.0/mlflow/states/get?state_id=${stateId}`,
            method: HTTPMethods.GET,
            success: async ({ resolve, response }: any) => {
              const json = await response.json();
              const name = json?.state.name;
              setState(name);
              resolve();
            },
          });
        }}
      />
      <RunViewDescriptionBox runUuid={runUuid} tags={tags} onDescriptionChanged={onRunDataUpdated} />
      <Typography.Title level={4}>
        <FormattedMessage defaultMessage="Details" description="Run page > Overview > Details section title" />
      </Typography.Title>
      <table
        css={{
          display: 'block',
          border: `1px solid ${theme.colors.borderDecorative}`,
          borderBottom: 'none',
          borderRadius: theme.general.borderRadiusBase,
          width: '50%',
          minWidth: 640,
          marginBottom: theme.spacing.lg,
          overflow: 'hidden',
        }}
      >
        <tbody css={{ display: 'block' }}>
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Created at"
                description="Run page > Overview > Run start time section label"
              />
            }
            value={runInfo.start_time ? Utils.formatTimestamp(runInfo.start_time) : <EmptyValue />}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Created by"
                description="Run page > Overview > Run author section label"
              />
            }
            value={<RunViewUserLinkBox runInfo={runInfo} tags={tags} />}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage defaultMessage="State" description="Run page > Overview > Run author section state" />
            }
            value={
              <div css={{ display: 'flex', flexDirection: 'row', width: '200px', alignItems: 'center' }}>
                <span>{state}</span>
                {
                  <Button
                    size="small"
                    css={{ marginLeft: 'auto' }}
                    componentId={'codegen_mlflow_app_src_common_components_editablenote.tsx_5251'}
                    onClick={() => {
                      setIsModalOpen(true)
                    }}
                  >
                    Change
                  </Button>
                }
              </div>
            }
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage defaultMessage="Status" description="Run page > Overview > Run status section label" />
            }
            value={<RunViewStatusBox status={runInfo.status} />}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage defaultMessage="Run ID" description="Run page > Overview > Run ID section label" />
            }
            value={runInfo.run_uuid}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Duration"
                description="Run page > Overview > Run duration section label"
              />
            }
            value={Utils.getDuration(runInfo.start_time, runInfo.end_time)}
          />
          {parentRunIdTag && (
            <RunViewMetadataRow
              title={<FormattedMessage defaultMessage="Parent run" description="Run page > Overview > Parent run" />}
              value={<RunViewParentRunBox parentRunUuid={parentRunIdTag.value} />}
            />
          )}
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Datasets used"
                description="Run page > Overview > Run datasets section label"
              />
            }
            value={
              datasets?.length ? (
                <RunViewDatasetBox tags={tags} runInfo={runInfo} datasets={datasets} />
              ) : (
                <EmptyValue />
              )
            }
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage defaultMessage="Tags" description="Run page > Overview > Run tags section label" />
            }
            value={<RunViewTagsBox runUuid={runInfo.run_uuid} tags={tags} onTagsUpdated={onRunDataUpdated} />}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage defaultMessage="Source" description="Run page > Overview > Run source section label" />
            }
            value={<RunViewSourceBox tags={tags} search={search} runUuid={runUuid} />}
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Logged models"
                description="Run page > Overview > Run models section label"
              />
            }
            value={
              loggedModels?.length > 0 ? (
                <RunViewLoggedModelsBox runInfo={runInfo} loggedModels={loggedModels} />
              ) : (
                <EmptyValue />
              )
            }
          />
          <RunViewMetadataRow
            title={
              <FormattedMessage
                defaultMessage="Registered models"
                description="Run page > Overview > Run models section label"
              />
            }
            value={
              registeredModels?.length > 0 ? (
                <RunViewRegisteredModelsBox runInfo={runInfo} registeredModels={registeredModels} />
              ) : (
                <EmptyValue />
              )
            }
          />
        </tbody>
      </table>
      <div css={{ display: 'flex', gap: theme.spacing.lg, minHeight: 360, maxHeight: 760, overflow: 'hidden' }}>
        <RunViewParamsTable params={params} runUuid={runUuid} />
        <RunViewMetricsTable latestMetrics={latestMetrics} runInfo={runInfo} />
      </div>
    </div>
  );
};
