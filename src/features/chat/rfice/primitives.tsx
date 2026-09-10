import styled from '@emotion/styled';
import { css } from '@emotion/react';
export const Row = styled.div<{ gap?: number }>`display:flex; flex-direction:row; gap:${({ gap = 0 }) => gap}px;`;
export const Column = styled.div<{ gap?: number }>`display:flex; flex-direction:column; gap:${({ gap = 0 }) => gap}px;`;
export const TypographyCSS = (_size: string, color = 'neutral_90_100') => css`font-size:15px;line-height:1.5;color:${color === 'warning_80_100' ? '#c94b45' : '#292b32'};`;
export const theme = { colors: { neutral_90_100: '#292b32', neutral_60_100: '#8d9099', deco9_50_100: '#6869cd', deco15_50_100: '#bd4a85' } };
