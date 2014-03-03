#!/usr/bin/env python
# -*- coding: UTF-8 -*-
# Copyright (c) 2012 Sylvain Prat. This program is open-source software,
# and may be redistributed under the terms of the MIT license. See the
# LICENSE file in this distribution for details.

import os
import re


try:
    from setuptools import setup
    has_setuptools = True
except ImportError:
    from distutils.core import setup
    has_setuptools = False


if has_setuptools:
    additional_setup_options = dict(
        install_requires=['yuicompressor'],
        entry_points={
            'distutils.commands': [
                'minify_js = minify.command:minify_js',
                'minify_css = minify.command:minify_css',
            ],
        },
    )
else:
    # The packages that need minify functionality should use import the minify.command
    # package and declare the cmdclass setup parameter like this:
    #cmdclass={
    #    'minify_js': minify.command.minify_js,
    #    'minify_css': minify.command.minify_css
    #},
    additional_setup_options = dict()


def read(*path_parts):
    here = os.path.dirname(__file__)
    return open(os.path.join(here, *path_parts)).read()


def find_version(*file_paths):
    version_file = read(*file_paths)
    version_match = re.search(r"^__version__ = ['\"]([^'\"]*)['\"]",
                              version_file, re.M)
    if version_match:
        return version_match.group(1)
    raise RuntimeError("Unable to find version string.")


# package description
desc = "Minify provides distutils/setuptools commands for minifying CSS and JS resources"
long_desc = '\n\n'.join(read(f) for f in ('README', 'CHANGES'))


setup(
    name='minify',
    version=find_version('minify', '__init__.py'),
    author='Sylvain Prat',
    author_email='sylvain.prat+minify@gmail.com',
    description=desc,
    long_description=long_desc,
    license='MIT License',
    keywords='minify,css,javascript,js,distutils,setuptools,command,setup.cfg',
    url='http://bitbucket.org/sprat/minify',
    packages=['minify'],
    platforms='any',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Topic :: Internet :: WWW/HTTP :: Site Management',
        'Programming Language :: Python',
    ],
    **additional_setup_options
)
