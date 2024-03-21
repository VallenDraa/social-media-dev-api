type State<T> = T;

export type Store<T> = {
	state: State<T>;
	getState: () => State<T>;
	setState: (updater: (state: State<T>) => State<T>) => void;
	resetStore: () => void;
};
