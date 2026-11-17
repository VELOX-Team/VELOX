import React, { useState, useEffect, useMemo, useRef } from 'react';
import htm from 'htm';

// قالب‌های htm مثل JSX هستند ولی نیازی به کامپایلر ندارند
export const html = htm.bind(React.createElement);
export { React, useState, useEffect, useMemo, useRef };
