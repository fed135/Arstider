# -*- coding: UTF-8 -*-
# Copyright (c) 2012 Sylvain Prat. This program is open-source software,
# and may be redistributed under the terms of the MIT license. See the
# LICENSE file in this distribution for details.

import glob
import os
import subprocess
import tempfile

import yuicompressor

from distutils.cmd import Command
from distutils.errors import DistutilsExecError, DistutilsOptionError


def remove_duplicates(lst):
    """
    Utility function to remove duplicates from a list while preserving the
    order of the elements
    """
    seen = set()
    seen_add = seen.add
    return [x for x in lst if x not in seen and not seen_add(x)]


class MinifyCommandBase(Command):
    # Options tuples: long name, short name and help string
    user_options = [
        ('sources=', None, 'sources files'),
        ('output=', None, 'minified output filename. If you provide a template'
                          ' output filename (e.g. "static/%s-min.ext"), the'
                          ' source files will be minified individually'),
        ('charset=', None, 'Read the input file(s) using <charset>'),
        ('line-break=', None, 'Insert a line break after the specified column'
                              ' number'),
    ]

    boolean_options = []
    compressor_options = ['charset', 'line_break']

    def initialize_options(self):
        self.sources = None
        self.output = None
        self.charset = None
        self.line_break = None

    def finalize_options(self):
        clean_path = os.path.normcase

        # output
        default_output = 'minified.%s' % self.minification_type
        self.ensure_string('output', default_output)
        self.output = clean_path(self.output)

        # sources
        self.ensure_string_list('sources')
        if self.sources:
            # retrieve the file list from the path specifications (wildcards),
            # and remove duplicates. We must preserve order, so don't use a set!
            self.sources = remove_duplicates(clean_path(path)
                                             for path in self._files_list(self.sources))

        # charset
        self.ensure_string('charset')

        # line break
        self.ensure_integer('line_break')

    def ensure_integer(self, option, default=None):
        val = getattr(self, option)
        if val is None:
            setattr(self, option, default)
            return default
        try:
            setattr(self, option, int(val))
        except ValueError:
            raise DistutilsOptionError(
                  "'%s' must be an integer (got `%s`)" % (option, val))
        return val

    @staticmethod
    def _files_list(path_specs):
        return [item for path in path_specs for item in glob.glob(path)]

    @staticmethod
    def _create_temporary_file():
        handle, path = tempfile.mkstemp(prefix='minify')
        os.close(handle)
        return path

    def _run_compressor(self, input_file, output_file):
        """Run the YUI compressor command on the input file in order to
        produce the output file"""
        yuicompressor_jar = yuicompressor.get_jar_filename()
        command_args = ['java', '-jar', yuicompressor_jar,
                        '--type', self.minification_type,
                        '-o' , output_file]

        # add additional compressor options
        for attr in self.compressor_options:
            value = getattr(self, attr, None)
            if value:
                option = '--' + attr.replace('_', '-')
                command_args.append(option)
                if attr not in self.boolean_options:
                    command_args.append(str(value))

        # add the input file
        command_args.append(input_file)

        try:
            subprocess.check_output(command_args, stderr=subprocess.STDOUT)
        except subprocess.CalledProcessError as exc:
            cmd = ' '.join(command_args)
            msg = 'Cannot run command "%s": %s' % (cmd, exc.output)
            raise DistutilsExecError(msg)

    @staticmethod
    def _combine_files(input_files, output_file):
        """Combine the input files to a big output file"""
        # we assume that all the input files have the same charset
        with open(output_file, mode='wb') as out:
            for input_file in input_files:
                out.write(open(input_file, mode='rb').read())

    def _minify_operation(self, sources, output):
        """Run a minification operation on the sources"""
        # special case for a single source
        if len(sources) == 1:
            self._run_compressor(sources.pop(), output)
            return

        # more that one file: we must combine them
        combined_filename = self._create_temporary_file()
        try:
            # combine the files into a big file
            self._combine_files(sources, combined_filename)
            # compress the big file
            self._run_compressor(combined_filename, output)
        finally:
            # delete the temporary file
            os.remove(combined_filename)

    def run(self):
        def output_path(source):
            name = os.path.splitext(os.path.basename(source))[0]
            return self.output % name

        if not self.sources:
            return  # nothing to do

        if '%' in self.output:
            # determine the output path for each source file
            sources_outputs = dict((source, output_path(source))
                                   for source in self.sources)

            # remove from the source files those that are also output files
            # of other sources (they may have been captured by a wildcard)
            outputs = set(sources_outputs.values())
            sources_outputs = dict((src, out)
                                   for (src, out) in sources_outputs.items()
                                   if src not in outputs)

            # finally, process the individual files separately
            for source, output in sources_outputs.items():
                msg = '%s -> %s' % (source, output)
                self.execute(self._minify_operation,
                             ([source], output),
                             msg=msg)
        else:
            # remove the output file from the sources files if necessary
            if self.output in self.sources:
                self.sources.remove(self.output)

            # combine the source files into a single output file
            msg = '%s -> %s' % (' + '.join(self.sources), self.output)
            self.execute(self._minify_operation,
                         (self.sources, self.output),
                         msg=msg)


class minify_css(MinifyCommandBase):
    description = """minify CSS resources"""
    minification_type = 'css'


class minify_js(MinifyCommandBase):
    description = """minify JS resources"""
    minification_type = 'js'

    user_options = MinifyCommandBase.user_options + [
        ('nomunge', None, 'Minify only, do not obfuscate'),
        ('preserve-semi', None, 'Preserve all semicolons'),
        ('disable-optimizations', None, 'Disable all micro optimizations'),
    ]
    _js_options = ['nomunge', 'preserve_semi', 'disable_optimizations']
    boolean_options = MinifyCommandBase.boolean_options + _js_options
    compressor_options = MinifyCommandBase.compressor_options + _js_options

    def initialize_options(self):
        MinifyCommandBase.initialize_options(self)
        self.nomunge = 0
        self.preserve_semi = 0
        self.disable_optimizations = 0
