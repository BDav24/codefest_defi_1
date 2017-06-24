/* @flow */
import NProgress from 'nprogress';
import './Spinner.css';

export function start() {
  NProgress.start();
}

export function done(force) {
  NProgress.done(force);
}

export function remove() {
  NProgress.remove();
}

export function set(n) {
  NProgress.set(n);
}

export function inc(n) {
  NProgress.inc(n);
}

export function getStatus() {
  return NProgress.status;
}
