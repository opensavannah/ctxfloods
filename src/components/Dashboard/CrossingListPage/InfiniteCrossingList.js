import React from 'react';
import DashboardCrossingListItem from 'components/Dashboard/CrossingListPage/DashboardCrossingListItem/DashboardCrossingListItem';
import {
  InfiniteLoader,
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import 'components/Dashboard/CrossingListPage/CrossingListPage.css';

let virtualizingList = [];
let listRef;

const cache = new CellMeasurerCache({
  defaultHeight: 400,
  fixedWidth: true,
});

export default class InfiniteCrossingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirtyCrossings: [],
    };

    this._isRowLoaded = this._isRowLoaded.bind(this);
    this._rowRenderer = this._rowRenderer.bind(this);
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this.clearMeasurerCache = this.clearMeasurerCache.bind(this);
    this.refreshList = this.refreshList.bind(this);
  }

  componentDidUpdate() {
    if (listRef) {
      this.refreshList();
      this.clearMeasurerCache();
    }
  }

  componentDidMount() {
    if (listRef) {
      this.refreshList();
      this.clearMeasurerCache();
    }
  }

  clearMeasurerCache(index) {
    if (index) {
      cache.clear(index);
    } else {
      cache.clearAll();
    }
    listRef.recomputeRowHeights();
  }

  saveDirtyUnmountedListItemState(dirtyState) {
    const savedDirties = this.state.dirtyCrossings;
    savedDirties[dirtyState.crossingId] = dirtyState;
    this.setState({ dirtyCrossings: savedDirties });
  }

  restoreDirtyUnmountedListItemState(crossingId) {
    const savedState = this.state.dirtyCrossings[crossingId];
    if (savedState) {
      const savedDirties = this.state.dirtyCrossings;
      savedDirties[crossingId] = null;
      this.setState({ dirtyCrossings: savedDirties });
    }
    return savedState;
  }

  refreshList() {
    listRef.forceUpdateGrid();
  }

  _isRowLoaded({ index }) {
    return !!virtualizingList[index];
  }

  _rowRenderer({ key, index, style, parent }) {
    const {
      statusReasons,
      currentUser,
      crossingQueryVariables,
      cqClassName,
      allCommunities,
    } = this.props;
    let crossing;

    if (index < virtualizingList.length) {
      crossing = virtualizingList[index].node;
    } else {
      return <div style={style} key={key} />;
    }

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ measure }) => (
          <div className="CrossingListItemMeasureContainer" style={style}>
            <DashboardCrossingListItem
              onDash={this.props.onDash}
              onLoad={measure}
              key={crossing.id}
              crossing={crossing}
              reasons={statusReasons}
              allCommunities={allCommunities}
              currentUser={currentUser}
              cqClassName={cqClassName}
              clearMeasurerCache={all =>
                this.clearMeasurerCache(all ? null : index)
              }
              refreshList={() => this.refreshList()}
              crossingQueryVariables={crossingQueryVariables}
              saveDirtyState={dirtyState =>
                this.saveDirtyUnmountedListItemState(dirtyState)
              }
              restoreDirtyState={crossingId =>
                this.restoreDirtyUnmountedListItemState(crossingId)
              }
              listOrMap="list"
            />
          </div>
        )}
      </CellMeasurer>
    );
  }

  _noRowsRenderer() {
    return <h1>No Rows returned from GraphQL fetch....</h1>;
  }

  render() {
    const { loadMoreRows, crossingsQuery } = this.props;

    if (!crossingsQuery) {
      return '';
    }

    virtualizingList = crossingsQuery.edges;

    return (
      <div style={{ height: 'calc(100vh - 140px)' }}>
        <InfiniteLoader
          isRowLoaded={this._isRowLoaded}
          loadMoreRows={loadMoreRows}
          rowCount={crossingsQuery.totalCount}
          threshold={10}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={ref => (registerChild = listRef = ref)}
                  className="List"
                  height={height}
                  width={width}
                  onRowsRendered={onRowsRendered}
                  rowCount={crossingsQuery.totalCount}
                  deferredMeasurementCache={cache}
                  rowHeight={cache.rowHeight}
                  rowRenderer={this._rowRenderer}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    );
  }
}
